# 🍿 MatchChairs

MatchChairs é uma aplicação web Full-stack com foco em mobile-first, criada para resolver um problema clássico: a indecisão na hora de escolher um filme para assistir a dois. Com uma interface estilo "Tinder" (Swipe), os usuários podem avaliar filmes em alta e o sistema cruza os dados para alertar quando há um "Match" perfeito.

## 🚀 Funcionalidades

- **Autenticação Segura:** Login e Registro com criptografia (bcrypt) e JWT (JSON Web Tokens).
- **Interface Otimista (Swipe):** Cartões de filmes que reagem instantaneamente (Gostei, Passei, Super Like) com animações fluidas e Glassmorphism.
- **Conexão de Casais:** Geração de código de convite exclusivo para vincular duas contas no banco de dados.
- **Motor de Matches:** Cruzamento de votos em tempo real. Apenas filmes curtidos por ambos aparecem na galeria do casal.
- **Integração com TMDB:** Consumo inteligente da API do The Movie Database para buscar as tendências sem exibir filmes já votados.

## 💻 Tecnologias que utilizei

**Front-end:**

- React.js (Vite)
- React Router DOM (Roteamento)
- Axios (Requisições HTTP)
- CSS3 (Mobile-first, Glassmorphism, CSS Transitions)

**Back-end:**

- Node.js & Express
- PostgreSQL (Banco de Dados Relacional)
- JWT (Autenticação)
- Bcrypt (Criptografia de senhas)

## 🛠️ Como rodar o projeto localmente

### 1. Clonar o repositório

git clone [https://github.com/Davison-Cruz/match-chairs-api.git](https://github.com/Davison-Cruz/match-chairs-api.git)

### 2. Configurar o Back-end

Navegue até a pasta do servidor e instale as dependências:

```
cd backend
npm install
```

## Crie um arquivo .env na raiz do backend baseando-se no arquivo de exemplo e insira suas credenciais:

```
PORT=3000
DATABASE_URL=sua_string_de_conexao_postgresql
JWT_SECRET=sua_chave_secreta_jwt
TMDB_TOKEN=seu_token_de_leitura_da_api_tmdb
```

```
npm run dev
```

## inicie o servidor:

```
npm run dev
```

### 3. Configurar o Front-end

Navegue até a pasta do front (front-end) e instale as dependências:

```
cd frontend
npm install
```

e inicie:

```
npm run dev
```

👨‍💻 Autor:

Desenvolvido por Davison Cruz - Desenvolvedor Full-stack.
