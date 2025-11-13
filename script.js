// script.js - carrega dados, renderiza cards, busca, filtro por setor e modal com descrição

const DATA_URL = 'data/companies.json'
const DEBUG = false

const cardsGrid = document.getElementById('cardsGrid')
const searchInput = document.getElementById('searchInput')
const searchBtn = document.getElementById('searchBtn')
const noResults = document.getElementById('noResults')
const modal = document.getElementById('modal')
const modalBody = document.getElementById('modalBody')
const modalClose = document.getElementById('modalClose')
const sectorFilter = document.getElementById('sectorFilter')

let companies = []
let activeSector = ''
let lastSearch = ''

async function loadData() {
  try {
    const res = await fetch(DATA_URL)
    if (!res.ok) throw new Error('Falha ao carregar dados')
    companies = await res.json()
    populateSectorFilter(companies)
    renderCards(companies)
  } catch (err) {
    cardsGrid.innerHTML = '<p>Erro ao carregar fornecedores.</p>'
    console.error(err)
  }
}

function populateSectorFilter(list) {
  const sectors = Array.from(
    new Set(
      list
        .map(c => c.sector && c.sector.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  sectors.forEach(sec => {
    const opt = document.createElement('option')
    opt.value = sec
    opt.textContent = sec
    sectorFilter.appendChild(opt)
  })
}

sectorFilter.addEventListener('change', () => {
  activeSector = sectorFilter.value
  applyFilters()
})

searchBtn.addEventListener('click', () => {
  lastSearch = searchInput.value.trim().toLowerCase()
  applyFilters()
})

searchInput.addEventListener('keyup', (e) => {
  lastSearch = searchInput.value.trim().toLowerCase()
  if (e.key === 'Enter') applyFilters()
  applyFilters(true) // busca em tempo real
})

function applyFilters(realTime = false) {
  let filtered = companies

  if (activeSector) {
    filtered = filtered.filter(c => (c.sector || '').toLowerCase() === activeSector.toLowerCase())
  }

  if (lastSearch) {
    filtered = filtered.filter(c => {
      const haystack = [
        c.name,
        c.short,
        c.description,
        c.service,
        c.sector,
        c.contact,
      ].join(' ').toLowerCase()
      return haystack.includes(lastSearch)
    })
  } else if (!realTime && !activeSector) {
    // sem busca e sem filtro -> mostrar todos
  }

  renderCards(filtered)
}

function createLogoElement(company) {
  const wrapper = document.createElement('div')
  wrapper.className = 'badge'

  const logoField = company.logo_filename || company.logo || ''
  if (!logoField) return buildBadgeFallback(wrapper)

  const withoutFiles = logoField.replace(/^files\//, '')
  const candidates = [
    logoField,
    withoutFiles,
    '/' + withoutFiles,
    withoutFiles.replace(/^assets\//, ''),
  ].filter(Boolean)

  const img = document.createElement('img')
  img.className = 'company-logo'
  img.alt = company.alt_text || company.name || 'logo'
  img.style.width = '84px'
  img.style.height = '84px'
  img.style.objectFit = 'cover'
  img.style.borderRadius = '50%'
  img.loading = 'lazy'

  let i = 0
  img.src = candidates[i]
  if (DEBUG) console.debug('Logo candidates for', company.name, candidates)

  img.onerror = function () {
    i++
    if (i < candidates.length) {
      img.src = candidates[i]
      return
    }
    img.remove()
    buildBadgeFallback(wrapper)
  }

  img.onload = function () {
    wrapper.innerHTML = ''
    wrapper.appendChild(img)
  }

  wrapper.innerHTML = ''
  wrapper.appendChild(img)
  return wrapper
}

function buildBadgeFallback(wrapper) {
  wrapper.innerHTML = ''
  const badge = document.createElement('div')
  badge.className = 'badge-inner'
  badge.style.whiteSpace = 'pre-line'
  badge.style.textAlign = 'center'
  badge.style.fontSize = '13px'
  badge.textContent = 'SELO\nVERDE'
  wrapper.appendChild(badge)
  return wrapper
}

function getSummary(company) {
  if (company.short && company.short.trim().length > 0) {
    return company.short.trim()
  }
  if (company.description && company.description.trim().length > 0) {
    const clean = company.description.trim().replace(/\s+/g, ' ')
    if (clean.length <= 160) return clean
    const cut = clean.slice(0, 160)
    const lastSpace = cut.lastIndexOf(' ')
    return cut.slice(0, lastSpace > 120 ? lastSpace : 160) + '…'
  }
  return 'Sem descrição disponível.'
}

function renderCards(list) {
  cardsGrid.innerHTML = ''
  if (!list.length) {
    noResults.hidden = false
    return
  }
  noResults.hidden = true

  list.forEach(c => {
    const card = document.createElement('article')
    card.className = 'card'
    card.tabIndex = 0

    const badgeEl = createLogoElement(c)

    const body = document.createElement('div')
    body.className = 'card-body'

    const title = document.createElement('h3')
    title.textContent = c.name

    const sectorTag = document.createElement('div')
    sectorTag.className = 'sector-tag'
    sectorTag.textContent = c.sector || 'Setor não informado'

    const summary = document.createElement('p')
    summary.textContent = getSummary(c)

    body.appendChild(title)
    body.appendChild(sectorTag)
    body.appendChild(summary)

    card.appendChild(badgeEl)
    card.appendChild(body)

    card.addEventListener('click', () => openModal(c))
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') openModal(c)
    })

    cardsGrid.appendChild(card)
  })
}

function openModal(company) {
  const practices = Array.isArray(company.practices) && company.practices.length
    ? company.practices.join(', ')
    : '—'

  const certifications = Array.isArray(company.certifications) && company.certifications.length
    ? company.certifications.join(', ')
    : '—'

  const sector = company.sector || '—'
  const selo = company.selo || '—'
  const description = company.description
    ? `<p style="margin-top:16px; line-height:1.55; font-size:15px">${escapeHtml(company.description)}</p>`
    : ''

  modalBody.innerHTML = `
    <h2 id="modalTitle" style="margin-top:0">${escapeHtml(company.name)}</h2>
    ${company.short ? `<p style="color:#5d7466;margin:4px 0 10px">${escapeHtml(company.short)}</p>` : ''}
    <div style="margin-top:4px;color:#4e6259;font-size:14px;line-height:1.5">
      <strong>Setor:</strong> ${escapeHtml(sector)}<br/>
      <strong>Selo:</strong> ${escapeHtml(selo)}<br/>
      ${company.contact ? `<strong>Contato:</strong> ${escapeHtml(company.contact)}<br/>` : ''}
      ${company.website ? `<strong>Site:</strong> <a href="${encodeURI(company.website)}" target="_blank" rel="noopener">${escapeHtml(company.website)}</a><br/>` : ''}
    </div>
    ${description}
  `
  modal.setAttribute('aria-hidden', 'false')
  modal.style.display = 'flex'
  modalClose.focus()
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true')
  modal.style.display = 'none'
}

function escapeHtml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

modalClose.addEventListener('click', closeModal)
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    closeModal()
  }
})

/* Inicialização */
loadData()