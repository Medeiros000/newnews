# Backend — New News

API backend do New News, construída com **Node.js + Express 5 + TypeScript + Prisma + SQLite + Redis + Zod**, seguindo os princípios de **Programação Orientada a Objetos (POO)**.

As notícias exibidas no app são coletadas automaticamente da **[Currents API](https://currentsapi.services/)**, armazenadas localmente no banco de dados e cacheadas no Redis.

---

## 🚀 Primeiros Passos

Na pasta `backend/`, instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` com base no `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
USE_REDIS=true
REDIS_URL="redis://localhost:6379"
CURRENTS_API_KEY="sua_chave_aqui"
```

> **Chave da API:** Obtenha uma chave gratuita em [currentsapi.services](https://currentsapi.services/).  
> **Sem Redis local?** Você pode definir `USE_REDIS=false` para utilizar o provedor de cache nulo em memória durante testes simples.

Gere o Prisma Client, aplique as migrações e popule o banco com as categorias iniciais:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Inicie o servidor da API:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

Em outro terminal, inicie o worker autônomo de ingestão:

```bash
npm run dev:worker
```

O worker executa uma busca de notícias imediatamente ao iniciar e repete a cada hora. Ele possui trava de concorrência para garantir que apenas um ciclo execute por vez.

---

## 🧰 Scripts Disponíveis

| Script | O que faz |
| :--- | :--- |
| `npm run dev` | Inicia a API em modo de desenvolvimento com hot-reload (`tsx watch`). |
| `npm run dev:worker` | Inicia o worker de ingestão com hot-reload. |
| `npm run build` | Compila o TypeScript para JavaScript em `dist/`. |
| `npm start` | Executa o servidor HTTP compilado em produção. |
| `npm run start:worker` | Executa o worker compilado em produção. |
| `npm test` | Executa os testes unitários via Jest. |
| `npm run lint` | Analisa problemas no código com Oxlint. |
| `npm run format` | Formata o código com Prettier. |
| `npm run db:generate` | Gera o cliente tipado do Prisma. |
| `npm run db:migrate` | Cria e aplica migrações no banco SQLite (`dev.db`). |
| `npm run db:seed` | Executa o script de seed de categorias (`prisma/seed.ts`). |
| `npm run db:studio` | Abre a interface visual do Prisma Studio no navegador. |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Runtime** | Node.js 20+ |
| **Framework HTTP** | Express 5 |
| **Linguagem** | TypeScript |
| **ORM** | Prisma 7 (com driver `@prisma/adapter-better-sqlite3`) |
| **Banco de Dados** | SQLite (`dev.db`) |
| **Cache** | Redis (`ioredis`) |
| **Validação** | Zod |
| **Fonte de Notícias** | Currents API |

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `DATABASE_URL` | `file:./dev.db` | URL de conexão com o banco SQLite. |
| `PORT` | `3000` | Porta onde o servidor HTTP escuta requisições. |
| `USE_REDIS` | `true` | Define se o cache Redis deve ser utilizado (`true`) ou ignorado (`false`). |
| `REDIS_URL` | `redis://localhost:6379` | URL de conexão com a instância do Redis. |
| `CURRENTS_API_KEY` | — | Chave de autenticação da Currents API para o worker. |

---

## 🔌 Rotas Ativas da API

Todas as rotas utilizam o prefixo `/api` (com exceção da raiz `/` que exibe uma página informativa).

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/` | Página HTML informativa de boas-vindas da API. |
| `GET` | `/api/health` | Verificação de status e disponibilidade do serviço. |
| `GET` | `/api/categories` | Lista todas as categorias cadastradas. |
| `GET` | `/api/categories/:id` | Retorna uma categoria específica pelo seu UUID. |
| `GET` | `/api/news` | Lista notícias com suporte a filtros (`query`, `category`) e paginação (`page`, `limit`). |
| `GET` | `/api/news/search` | Alias alternativo de busca textual para `/api/news`. |
| `GET` | `/api/news/:id` | Retorna uma notícia específica pelo seu UUID. |
| `GET` | `/api/news/:id/related` | Retorna notícias relacionadas da mesma categoria (parâmetro `limit`). |

---

## 📂 Estrutura de Pastas

```text
backend/
├── prisma/
│   ├── migrations/            # Histórico de migrações do banco
│   ├── schema.prisma          # Definição dos models (Category, News)
│   └── seed.ts                # Script de inserção inicial de categorias
│
├── src/
│   ├── config/                # Validação de variáveis de ambiente com Zod (env.ts)
│   ├── controllers/           # Orquestração HTTP (NewsController, CategoryController)
│   ├── mappers/               # Conversores Prisma -> Entidades de Domínio
│   ├── models/entities/       # Classes das entidades de domínio (News, Category)
│   ├── queries/               # Normalização e validação de query params
│   ├── routes/                # Classes de rotas do Express (NewsRouter, CategoryRouter, HealthRouter, IndexRouter)
│   ├── services/              # Camada de negócio e acesso a dados (NewsService, CategoryService, PrismaService)
│   │   ├── cache/             # Provedores de cache (RedisCacheProvider, NullCacheProvider)
│   │   └── newsIngestion/     # Pipeline de coleta (CurrentsApiClient, Normalizer, Validator, Repository)
│   ├── workers/               # Agendamento e controle de execução do worker (NewsIngestionWorker)
│   ├── app.ts                 # Configuração do Express, middlewares e tratamento global de erros
│   ├── server.ts              # Ponto de entrada do servidor HTTP
│   └── worker.ts              # Ponto de entrada do worker autônomo
│
├── .env.example
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## 📖 Especificações Detalhadas e Diagramas

Para consultar os contratos detalhados de requisição/resposta, modelo relacional completo e diagramas de fluxo, consulte a documentação oficial:

- 📑 **[Contratos de API (`docs/backend/api/`)](../docs/backend/api/news-route.md)**
- 🗄️ **[Modelo de Dados Relacional](../docs/backend/er_docs/er_doc.md)**
- 📰 **[Pipeline de Ingestão de Notícias](../docs/backend/news-collection/news-collection.md)**
- 🛠️ **[Guia para Adicionar Novas Rotas e Seeds](../docs/backend/Criacao_de_rotas_e_seeds.md)**
