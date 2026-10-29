# Backend — New News

API REST corporativa do New News construída com **Node.js + Express 5 + TypeScript + Prisma ORM + PostgreSQL + Redis + Zod**.

As notícias exibidas na plataforma são consumidas automaticamente da **[Currents API](https://currentsapi.services/)**, processadas e tratadas via **Chain of Responsibility**, validadas com Zod e persistidas no PostgreSQL com camada de cache inteligente no Redis.

---

## 🚀 Primeiros Passos

### 1. Instalação de Dependências

Acesse a pasta `backend/` e instale os pacotes:

```bash
npm install
```

### 2. Configuração de Ambiente

Crie o arquivo `.env` com base no `.env.example`:

```env
DATABASE_URL="postgresql://newnews:newnews_dev@localhost:5432/newnews"
PORT=3000
REDIS_URL="redis://localhost:6379"
CURRENTS_API_KEY="sua_chave_aqui"
CURRENTS_API_BASE_URL="https://api.currentsapi.services/v1/latest-news"
DEVELOPMENT_MODE=true
```

> Obtenha sua chave de API gratuita em [currentsapi.services](https://currentsapi.services/).

### 3. Banco de Dados e Migrations

Com os contêineres Docker ativos (`docker compose up -d`), gere o Prisma Client e execute as migrations:

```bash
npm run db:generate
npm run db:migrate
```

Para popular categorias e registros de teste:

```bash
npm run db:seed
```

### 4. Executando a Aplicação

```bash
# Modo desenvolvimento (com hot-reload via tsx)
npm run dev

# Compilação TypeScript para produção
npm run build

# Execução do bundle gerado em produção
npm start
```

A API estará disponível em:

```text
http://localhost:3000
```

---

## 🧰 Scripts Disponíveis

| Comando               | Descrição                                                    |
| --------------------- | ------------------------------------------------------------ |
| `npm run dev`         | Inicia o servidor com hot-reload (`tsx watch src/server.ts`) |
| `npm run build`       | Compila o código TypeScript para a pasta `dist/`             |
| `npm start`           | Executa a versão compilada (`node dist/src/server.js`)       |
| `npm run lint`        | Executa a análise estática ultrarrápida com `oxlint`         |
| `npm run format`      | Formata todos os arquivos do backend via Prettier (tab 2)    |
| `npm run db:generate` | Gera os tipos e cliente Prisma em `generated/prisma/`        |
| `npm run db:migrate`  | Aplica as migrations versionadas ao PostgreSQL               |
| `npm run db:seed`     | Executa o seed de dados iniciais (`prisma/seed.ts`)          |
| `npm run db:studio`   | Abre o painel visual de administração do Prisma Studio       |

---

## 🛠️ Stack Tecnológica

| Camada / Responsabilidade | Tecnologia                             |
| ------------------------- | -------------------------------------- |
| Runtime                   | Node.js 24+ (ES Modules)               |
| Framework HTTP            | Express 5                              |
| Linguagem                 | TypeScript                             |
| ORM                       | Prisma 7 (com `@prisma/adapter-pg`)    |
| Banco de Dados Relacional | PostgreSQL 16                          |
| Camada de Cache           | Redis (ioredis)                        |
| Validação de Esquemas     | Zod                                    |
| Provedor de Notícias      | Currents API                           |
| Orquestração de Containers| Docker Compose                         |
| Linter & Formatador       | Oxlint & Prettier                      |

---

## 🏗️ Padrões de Projeto e Arquitetura

O backend adota padrões consolidados de Orientação a Objetos e boas práticas arquiteturais:

### 1. Chain of Responsibility (Ingestão de Notícias)
O ciclo de ingestão é desacoplado em handlers especializados, onde cada etapa decide processar, passar adiante (`passToNext`) ou interromper a execução (`return null`):

```text
NewsSchedulerHandler (Timer de 1 hora / IngestNewsCommand)
         │
         ▼
  FetchNewsHandler (Requisição HTTP à Currents API com timeout e retry)
         │
         ▼
NormalizationHandler (Sanitização HTML, parse de datas e geração de slug)
         │
         ▼
 ValidationHandler (Validação estrita de schema Zod)
         │
         ▼
DeduplicationHandler (Deduplicação no banco de dados e lote em memória)
         │
         ▼
NewsInsertionHandler (Persistência no PostgreSQL e associação de categoria)
         │
         ▼
CacheEvictionHandler (Invalidação pontual do cache Redis 'news:list:*')
```
> Para documentação técnica detalhada de cada handler e diagramas, consulte [`chain.md`](../chain.md).

### 2. Command Pattern
- A interface [`ICommand`](src/commands/ICommand.ts) padroniza ações executáveis.
- O [`IngestNewsCommand`](src/commands/IngestNewsCommand.ts) encapsula a execução do pipeline de notícias, desacoplando o invocador da lógica concreta do receptor.

### 3. Segregação de Interfaces (ISP) & Injeção de Dependências
- Controladores dependem de abstrações (ex: `INewsService`, `ICategoryService`, `IUserService`), facilitando testes unitários e criação de mocks.
- Serviços utilizam instâncias singleton compartilhadas (`PrismaService.getInstance()`, `RedisService.getInstance()`).

---

## 🪵 Sistema de Logs Corporativo

O backend possui uma classe dedicada [`Logger`](src/utils/Logger.ts) com os seguintes recursos:
- **Padronização no Console:** Saídas no formato `[ISO_TIMESTAMP] [LEVEL] [CONTEXT]: Mensagem`.
- **Persistência Assíncrona no PostgreSQL:** Todo log emitido pelo backend é gravado na tabela **`logs`** (`id`, `level`, `context`, `message`, `metadata`, `created_at`).
- **Comportamento Não-Bloqueante:** Falhas de gravação do log não interrompem a aplicação nem as respostas HTTP.

> Consulte [`logs.md`](../logs.md) para detalhes da tabela, índices e contextos registrados.

---

## ⚙️ Variáveis de Ambiente

| Variável                 | Tipo      | Obrigatório | Exemplo / Padrão                                       |
| ------------------------ | --------- | ----------- | ------------------------------------------------------ |
| `DATABASE_URL`           | `string`  | Sim         | `postgresql://newnews:newnews_dev@localhost:5432/newnews` |
| `PORT`                   | `number`  | Sim         | `3000`                                                 |
| `REDIS_URL`              | `string`  | Sim         | `redis://localhost:6379`                               |
| `CURRENTS_API_KEY`       | `string`  | Recomendado | Chave gerada na Currents API                           |
| `CURRENTS_API_BASE_URL`  | `string`  | Sim         | `https://api.currentsapi.services/v1/latest-news`      |
| `DEVELOPMENT_MODE`       | `boolean` | Não         | `false`                                                |

---

## 🔌 Documentação dos Endpoints da API

Todas as rotas de negócio utilizam o prefixo `/api`.

### 1. Health Check

```http
GET /api/health
```

**Resposta `200 OK`:**
```json
{
  "status": "ok",
  "service": "newnews-api",
  "timestamp": "2026-10-28T21:00:00.000Z"
}
```

---

### 2. Notícias (`/api/news`)

| Método | Rota                    | Descrição                                         |
| ------ | ----------------------- | ------------------------------------------------- |
| `GET`  | `/api/news`             | Lista notícias paginadas com busca e filtros      |
| `POST` | `/api/news`             | Cria uma nova notícia manualmente                 |
| `GET`  | `/api/news/search`      | Alias de busca textual de notícias                |
| `GET`  | `/api/news/:id`         | Busca notícia por UUID                            |
| `GET`  | `/api/news/:id/related` | Busca até 4 notícias relacionadas (mesma categoria) |
| `GET`  | `/api/news/pt-br/:slug` | Busca notícia pelo slug legível                   |

#### `GET /api/news`
**Query Parameters suportados:**
- `page`: Número da página (padrão: `1`)
- `limit`: Quantidade de itens por página (padrão: `10`)
- `query` ou `q`: Termo de busca em título e conteúdo
- `category`: Nome da categoria (ex: `tecnologia`, `geral`, `negocios`)

**Resposta `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "e2a34567-89ab-cdef-0123-456789abcdef",
      "category_id": 1,
      "badge_bg": "bg-blue-500",
      "title": "Título da Notícia",
      "slug": "titulo-da-noticia",
      "content": "Conteúdo formatado...",
      "image_url": "https://...",
      "news_url": "https://...",
      "published_at": "2026-10-28T12:00:00.000Z",
      "author": "Redação",
      "source": "canaltech.com.br",
      "category": {
        "id": 1,
        "name": "tecnologia",
        "label": "Tecnologia",
        "icon": "Cpu"
      }
    }
  ]
}
```

#### `POST /api/news`
**Corpo da Requisição (JSON):**
```json
{
  "category_id": 1,
  "badge_bg": "bg-blue-500",
  "title": "Nova Notícia Importante",
  "slug": "nova-noticia-importante",
  "content": "Conteúdo completo da notícia...",
  "image_url": "https://exemplo.com/imagem.jpg",
  "news_url": "https://exemplo.com/materia",
  "published_at": "2026-10-28T14:00:00.000Z",
  "author": "Redação",
  "source": "G1"
}
```

---

### 3. Categorias (`/api/categories`)

| Método | Rota                   | Descrição                                 |
| ------ | ---------------------- | ----------------------------------------- |
| `GET`  | `/api/categories`      | Retorna todas as categorias cadastradas   |
| `GET`  | `/api/categories/:id`  | Retorna os detalhes de uma categoria por ID |

**Resposta `200 OK` em `/api/categories`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "tecnologia",
      "label": "Tecnologia",
      "icon": "Cpu"
    },
    {
      "id": 2,
      "name": "geral",
      "label": "Geral",
      "icon": "Globe"
    }
  ]
}
```

---

### 4. Usuários (`/api/users`)

| Método | Rota                   | Descrição                                     |
| ------ | ---------------------- | --------------------------------------------- |
| `GET`  | `/api/users/:email`    | Busca dados de perfil do usuário pelo e-mail  |

---

## 🗄️ Modelagem do Banco de Dados (Prisma)

O arquivo [`prisma/schema.prisma`](prisma/schema.prisma) contém as seguintes tabelas:

1. **`users` (`User`)**: Usuários da plataforma (`id`, `name`, `email`, `password`, `avatar`, `created_at`, `updated_at`).
2. **`categories` (`Category`)**: Categorias temáticas das notícias (`id`, `name`, `label`, `icon`).
3. **`news` (`News`)**: Notícias persistidas (`id`, `category_id`, `badge_bg`, `title`, `slug`, `content`, `image_url`, `news_url`, `published_at`, `author`, `source`).
4. **`logs` (`Log`)**: Auditoria e logs do backend (`id`, `level`, `context`, `message`, `metadata`, `created_at`).

---

## 📂 Estrutura Completa de Pastas

```text
backend/
├── prisma/
│   ├── migrations/            # Histórico de migrations versionadas
│   ├── schema.prisma          # Modelos de dados relacionais
│   └── seed.ts                # Povoamento inicial de categorias
│
├── src/
│   ├── commands/              # Padrão Command
│   │   ├── ICommand.ts
│   │   └── IngestNewsCommand.ts
│   ├── config/                # Validação de variáveis de ambiente com Zod
│   │   └── env.ts
│   ├── controllers/           # Controladores Express e interfaces
│   │   ├── interfaces/
│   │   ├── CategoryController.ts
│   │   ├── NewsController.ts
│   │   └── UserController.ts
│   ├── dtos/                  # Objetos de transferência de dados (DTOs)
│   │   └── CreateNewsDto.ts
│   ├── mappers/               # Conversores Prisma -> Entidades de Domínio
│   │   ├── CategoryMapper.ts
│   │   ├── NewsMapper.ts
│   │   └── UserMapper.ts
│   ├── models/entities/       # Entidades de Domínio puras (POO)
│   │   ├── Category.ts
│   │   ├── News.ts
│   │   └── User.ts
│   ├── queries/               # Utilitários de paginação e filtros (QueryOptions)
│   │   └── QueryOptions.ts
│   ├── routes/                # Definição e montagem de rotas Express
│   │   ├── CategoryRouter.ts
│   │   ├── HealthRouter.ts
│   │   ├── NewsRouter.ts
│   │   ├── UserRouter.ts
│   │   └── index.ts
│   ├── services/              # Regras de negócio e acesso à infraestrutura
│   │   ├── interfaces/        # Contratos de serviços (ISP)
│   │   ├── newsIngestion/     # Ingestão de Notícias via Chain of Responsibility
│   │   │   ├── handlers/      # Handlers especializados da cadeia
│   │   │   │   ├── CacheEvictionHandler.ts
│   │   │   │   ├── DeduplicationHandler.ts
│   │   │   │   ├── FetchNewsHandler.ts
│   │   │   │   ├── INewsHandler.ts
│   │   │   │   ├── NewsInsertionHandler.ts
│   │   │   │   ├── NewsSchedulerHandler.ts
│   │   │   │   ├── NormalizationHandler.ts
│   │   │   │   └── ValidationHandler.ts
│   │   │   ├── CurrentsApiClient.ts
│   │   │   ├── NewsIngestionPipeline.ts
│   │   │   ├── NewsNormalizer.ts
│   │   │   ├── NewsRepository.ts
│   │   │   └── NewsValidator.ts
│   │   ├── CategoryService.ts
│   │   ├── NewsService.ts
│   │   ├── PrismaService.ts
│   │   ├── RedisService.ts
│   │   └── UserService.ts
│   ├── utils/                 # Utilitários gerais
│   │   ├── Logger.ts          # Sistema de logs com persistência no banco
│   │   └── slugify.ts         # Sanitização de slugs
│   ├── app.ts                 # Configuração do Express e middlewares
│   └── server.ts              # Inicialização do servidor HTTP e shutdown
│
├── .env.example
├── package.json
├── prisma.config.ts
└── tsconfig.json
```
