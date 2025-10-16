# EcoCampus — Catálogo de Selos Verdes (estático)

Site estático simples em HTML/CSS/JS que exibe fornecedores com "selos verdes".

## Estrutura de arquivos
- index.html — página principal
- styles.css — estilos
- script.js — lógica para carregar dados, busca e modal
- data/companies.json — dados dos fornecedores (edite para adicionar)
- assets/ — imagens e logos (coloque as imagens aqui)

## Como usar / editar fornecedores
1. Abra `data/companies.json` e adicione objetos no formato:
   {
     "name": "Nome da Empresa",
     "logo": "assets/logo-empresa.jpg", // opcional
     "short": "Breve descrição (1-2 linhas)",
     "service": "Serviço ofertado",
     "contact": "email ou telefone",
     "website": "https://..."
   }

2. Salve e abra `index.html` no navegador (ou faça deploy).

## Deploy (recomendado)
- GitHub Pages: conectar o repositório e escolher branch `main` / folder `/ (root)`.
- Netlify/Vercel: conectar repositório e deploy automático (gratuito para projetos estáticos).

## Observações
- Coloque logos em `assets/` e atualize `data/companies.json` com os caminhos.
- Para evitar que o GitHub Pages processe arquivos com Jekyll, já incluí um arquivo `.nojekyll`.

Se quiser, eu posso integrar as imagens que você enviar e terminar a publicação no GitHub Pages para você.