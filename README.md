# 🍿 MatchChairs API

Uma API RESTful desenvolvida em Node.js para o **MatchChairs**, um aplicativo estilo "Tinder" para casais decidirem juntos quais filmes e séries assistir.

## 🚀 Tecnologias Utilizadas

- **Backend:** Node.js com Express
- **Banco de Dados:** PostgreSQL (Hospedado na nuvem via Neon)
- **Segurança:** Autenticação via JWT (JSON Web Tokens) e criptografia com Bcrypt
- **Integração:** API externa do TMDB (The Movie Database) - _Em breve_

## ⚙️ Funcionalidades Atuais

- [x] Arquitetura Cloud configurada
- [x] Cadastro de usuários com validação de maioridade
- [x] Criptografia de senhas
- [x] Sistema de Login seguro com geração de token JWT

## 🛠️ Como rodar localmente

1. Clone este repositório.
2. Instale as dependências:
   \`npm install\`
3. Crie um arquivo \`.env\` na raiz e adicione suas variáveis:
   \`PORT=3000\`
   \`DATABASE_URL=sua_url_do_postgres\`
   \`JWT_SECRET=sua_chave_secreta\`
4. Inicie o servidor:
   \`npm run dev\`
