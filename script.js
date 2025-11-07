// script.js - carrega dados, renderiza cards, implementa busca e modal

const DATA_URL = 'data/companies.json'

const cardsGrid = document.getElementById('cardsGrid')
const searchInput = document.getElementById('searchInput')
const searchBtn = document.getElementById('searchBtn')
const noResults = document.getElementById('noResults')
const modal = document.getElementById('modal')
const modalBody = document.getElementById('modalBody')
const modalClose = document.getElementById('modalClose')

let companies = []

async function loadData(){
  try{
    const res = await fetch(DATA_URL)
    if(!res.ok) throw new Error('Falha ao carregar dados')
    companies = await res.json()
    renderCards(companies)
  }catch(err){
    cardsGrid.innerHTML = '<p>Erro ao carregar fornecedores.</p>'
    console.error(err)
  }
}

function createLogoElement(company) {
  const wrapper = document.createElement('div')
  wrapper.className = 'badge' // mantém estilo atual

  // prefer logo_filename (se veio do JSON), senão usa logo
  const logoField = company.logo_filename || company.logo || ''

  if (!logoField) {
    // sem informação de logo -> badge fallback
    const badge = document.createElement('div')
    badge.className = 'badge-inner'
    badge.style.whiteSpace = 'pre-line'
    badge.style.textAlign = 'center'
    badge.style.fontSize = '13px'
    badge.textContent = 'SELO\nVERDE'
    wrapper.innerHTML = ''
    wrapper.appendChild(badge)
    return wrapper
  }

  // montar candidatos que cobrem os cenários mais comuns
  const withoutFiles = logoField.replace(/^files\//, '')
  const candidates = [
    logoField,                // caminho exatamente como no JSON
    withoutFiles,             // remove leading "files/"
    '/' + withoutFiles,       // root-relative
    withoutFiles.replace(/^assets\//, ''), // alternativa sem assets/ (se necessário)
  ].filter(Boolean)

  // criar img e tentar carregar candidatos
  const img = document.createElement('img')
  img.className = 'company-logo'
  img.alt = company.alt_text || company.name || 'logo'
  img.style.width = '84px'
  img.style.height = '84px'
  img.style.objectFit = 'cover'
  img.style.borderRadius = '50%'

  let i = 0
  img.src = candidates[i]

  // debug (remova ou comente em produção se quiser)
  console.debug('Logo candidates for', company.name, candidates)

  img.onerror = function () {
    i++
    if (i < candidates.length) {
      img.src = candidates[i]
      return
    }
    // todos falharam -> mostrar badge em vez de img
    img.remove()
    const badge = document.createElement('div')
    badge.className = 'badge-inner'
    badge.style.whiteSpace = 'pre-line'
    badge.style.textAlign = 'center'
    badge.style.fontSize = '13px'
    badge.textContent = 'SELO\nVERDE'
    wrapper.innerHTML = ''
    wrapper.appendChild(badge)
  }

  img.onload = function () {
    // imagem carregou corretamente; garantir que o wrapper contenha apenas a img
    wrapper.innerHTML = ''
    wrapper.appendChild(img)
  }

  // inicialmente colocar img (irá disparar onload ou onerror)
  wrapper.innerHTML = ''
  wrapper.appendChild(img)
  return wrapper
}

function renderCards(list){
  cardsGrid.innerHTML = ''
  if(!list.length){
    noResults.hidden = false
    return
  }
  noResults.hidden = true

  list.forEach(c => {
    const card = document.createElement('article')
    card.className = 'card'
    card.tabIndex = 0

    // Badge / logo (usa createLogoElement agora)
    const badgeEl = createLogoElement(c)

    const body = document.createElement('div')
    body.className = 'card-body'
    const title = document.createElement('h3')
    title.textContent = c.name
    const short = document.createElement('p')
    short.textContent = c.short || ''
    const more = document.createElement('p')
    more.style.marginTop = '10px'
    more.style.fontSize = '13px'
    more.style.color = '#7f8b85'
    more.textContent = c.contact ? `Contato: ${c.contact}` : ''

    body.appendChild(title)
    body.appendChild(short)
    body.appendChild(more)

    card.appendChild(badgeEl)
    card.appendChild(body)

    // abrir modal com detalhes
    card.addEventListener('click', () => openModal(c))
    card.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') openModal(c)
    })

    cardsGrid.appendChild(card)
  })
}

function openModal(company){
  modalBody.innerHTML = `
    <h2 id="modalTitle">${company.name}</h2>
    <p style="color:#6f8b80">${company.short || ''}</p>
    <div style="margin-top:12px;color:#5f776f">
      <strong>Serviço:</strong> ${company.service || '—'}<br/>
      ${company.contact ? `<strong>Contato:</strong> ${company.contact}<br/>` : ''}
      ${company.website ? `<strong>Site:</strong> <a href="${company.website}" target="_blank">${company.website}</a>` : ''}
    </div>
  `
  modal.setAttribute('aria-hidden', 'false')
  modal.style.display = 'flex'
}

function closeModal(){
  modal.setAttribute('aria-hidden', 'true')
  modal.style.display = 'none'
}

searchBtn.addEventListener('click', () => doSearch())
searchInput.addEventListener('keyup', (e) => {
  if(e.key === 'Enter') doSearch()
  // busca em tempo real opcional:
  doSearch(true)
})

function doSearch(realTime = false){
  const q = searchInput.value.trim().toLowerCase()
  if(!q && !realTime){
    renderCards(companies)
    return
  }
  const filtered = companies.filter(c => {
    return [c.name, c.short, c.service, c.contact].join(' ').toLowerCase().includes(q)
  })
  renderCards(filtered)
}

modalClose.addEventListener('click', closeModal)
modal.addEventListener('click', (e) => {
  if(e.target === modal) closeModal()
})

/* Inicialização */
loadData()
