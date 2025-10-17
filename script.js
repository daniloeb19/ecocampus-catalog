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

    // Badge / logo
    const badge = document.createElement('div')
    badge.className = 'badge'
    if(c.logo){
      // se houver logo, usamos imagem circular
      const img = document.createElement('img')
      img.src = c.logo
      img.alt = `${c.name} logo`
      img.style.width = '84px'
      img.style.height = '84px'
      img.style.objectFit = 'cover'
      img.style.borderRadius = '50%'
      badge.innerHTML = ''
      badge.appendChild(img)
    } else {
      // CORREÇÃO: usar \n em vez de quebra de linha literal
      badge.textContent = 'SELO\nVERDE'
      badge.style.whiteSpace = 'pre-line'
      badge.style.textAlign = 'center'
      badge.style.fontSize = '13px'
    }

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

    card.appendChild(badge)
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
