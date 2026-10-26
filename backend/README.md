# Backend — New News

API backend do New News, construída com **Node.js + Express + TypeScript + Prisma + SQLite + Redis + Zod**.

As notícias exibidas no app são obtidas automaticamente da **[Currents API](https://currentsapi.services/)** e armazenadas localmente no banco de dados.

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
REDIS_URL="redis://localhost:6379"
CURRENTS_API_KEY="sua_chave_aqui"
```

> Obtenha uma chave gratuita em [currentsapi.services](https://currentsapi.services/).

Gere o Prisma Client e aplique as migrations:

```bash
npm run db:generate
npm run db:migrate
```

Inicie o servidor:

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3000
```

> **Banco de dados:** o SQLite será criado em `dev.db`.

---

## 🧰 Scripts

| Script                | O que faz                                   |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Inicia o servidor de desenvolvimento        |
| `npm run build`       | Compila o projeto para produção             |
| `npm start`           | Executa o projeto compilado                 |
| `npm run db:generate` | Gera o Prisma Client                        |
| `npm run db:migrate`  | Cria e aplica migrations                    |
| `npm run db:studio`   | Abre o Prisma Studio                        |

---

## 🛠️ Stack

| Responsabilidade    | Tecnologia      |
| ------------------- | --------------- |
| Runtime             | Node.js 20+     |
| Framework HTTP      | Express 5       |
| Linguagem           | TypeScript      |
| ORM                 | Prisma          |
| Banco de dados      | SQLite          |
| Cache               | Redis (ioredis) |
| Validação           | Zod             |
| Fonte de notícias   | Currents API    |
| Containerização     | Docker          |

---

## 📰 Ingestão de Notícias (Currents API)

O backend busca notícias automaticamente da **[Currents API](https://currentsapi.services/)** através de um pipeline de ingestão que roda ao iniciar o servidor e depois **a cada hora**.

### Pipeline

```
CurrentsApiClient → Category lookup → NewsNormalizer → NewsValidator → NewsDeduplicator → NewsRepository
```

| Etapa                 | Responsabilidade                                              |
| --------------------- | ------------------------------------------------------------- |
| `CurrentsApiClient`   | Faz a requisição à API e retorna os artigos brutos            |
| `Category lookup`     | Compara o primeiro item de `category` com `Category.name` ou com seus termos separados por `_`; sem categoria, usa `general` |
| `NewsNormalizer`      | Transforma o formato da API no schema interno da aplicação    |
| `NewsValidator`       | Descarta artigos inválidos ou incompletos                     |
| `NewsDeduplicator`    | Filtra artigos já existentes no banco (1 única query em lote) |
| `NewsRepository`      | Persiste os artigos novos e invalida o cache de listagem      |

Após cada ingestão bem-sucedida, o cache Redis das listagens (`news:list:*`) é invalidado automaticamente.

### Variável de ambiente obrigatória

| Variável           | Descrição                        |
| ------------------ | -------------------------------- |
| `CURRENTS_API_KEY` | Chave de acesso à Currents API   |

---

## ⚙️ Variáveis de Ambiente

| Variável               | Exemplo                      | Descrição                                  |
| ---------------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL`         | `file:./dev.db`              | URL de conexão com o banco SQLite          |
| `PORT`                 | `3000`                       | Porta utilizada pela API                   |
| `REDIS_URL`            | `redis://localhost:6379`     | URL de conexão com o Redis (cache)         |
| `CURRENTS_API_KEY`     | `abc123...`                  | Chave de acesso à Currents API             |

> O arquivo `.env` é necessário para executar comandos locais que dependem dessas variáveis.

---

## 🔌 API

Todas as rotas utilizam o prefixo `/api`.

### Health Check

```http
GET /api/health
```

Verifica se a API está ativa.

**Resposta `200 OK`:**

```json
{
  "status": "ok",
  "service": "newnews-api",
  "timestamp": "2026-10-06T13:00:00.000Z"
}
```

### Notícias

| Método | Rota                     | Descrição                                        |
| ------ | ------------------------ | ------------------------------------------------ |
| `GET`  | `/api/news`              | Lista notícias com paginação e busca por texto   |
| `GET`  | `/api/news/:id`          | Retorna uma notícia pelo ID                      |
| `GET`  | `/api/news/:id/related`  | Retorna notícias relacionadas (mesma categoria)  |

#### `GET /api/news`

**Query params:**

| Parâmetro | Tipo     | Padrão | Descrição                                          |
| --------- | -------- | ------ | -------------------------------------------------- |
| `query`   | `string` | —      | Texto para busca em título, resumo e conteúdo      |
| `q`       | `string` | —      | Alias de `query`                                   |
| `page`    | `number` | `1`    | Página (mínimo 1)                                  |
| `limit`   | `number` | `10`   | Itens por página (máximo 100)                      |

**Resposta `200 OK`:**

```json
{
  "source": "database",
  "type": "all",
  "query": null,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 120,
    "totalPages": 12
  },
  "data": []
}
```

> O campo `source` indica se a resposta veio do `cache` (Redis) ou do `database`.

#### `GET /api/news/:id/related`

**Query params:**

| Parâmetro | Tipo     | Padrão | Descrição                          |
| --------- | -------- | ------ | ---------------------------------- |
| `limit`   | `number` | `4`    | Quantidade de notícias (máximo 50) |

### Usuários

| Método | Rota         | Descrição         |
| ------ | ------------ | ----------------- |
| `GET`  | `/api/users` | Lista os usuários |
| `POST` | `/api/users` | Cria um usuário   |

#### `POST /api/users`

**Body:**

| Campo   | Tipo     | Regras                |
| ------- | -------- | --------------------- |
| `email` | `string` | E-mail válido e único |
| `name`  | `string` | 1–120 caracteres      |

---

## ⚠️ Respostas de Erro

### `400 Bad Request`

```json
{
  "error": "Invalid request body",
  "issues": []
}
```

### `404 Not Found`

```json
{
  "error": "Not found"
}
```

### `500 Internal Server Error`

```json
{
  "error": "Internal server error"
}
```

---

## 🗄️ Banco de Dados

O schema do Prisma está em:

```text
prisma/schema.prisma
```

Criar uma nova migration:

```bash
npm run db:migrate -- --name nome_da_migration
```

Abrir o Prisma Studio:

```bash
npm run db:studio
```

---

## 📂 Estrutura de Pastas

```text
backend/
├── prisma/
│   ├── migrations/        # Migrations do banco
│   └── schema.prisma      # Schema do Prisma
│
├── src/
│   ├── config/            # Configurações e variáveis de ambiente
│   ├── controllers/       # Lógica dos endpoints (newsController, userController)
│   ├── lib/               # Instâncias compartilhadas (Prisma, Redis)
│   ├── routes/            # Definição das rotas da API
│   ├── services/
│   │   └── newsIngestion/ # Pipeline de ingestão da Currents API
│   │       ├── CurrentsApiClient.ts
│   │       ├── NewsNormalizer.ts
│   │       ├── NewsValidator.ts
│   │       ├── NewsDeduplicator.ts
│   │       ├── NewsRepository.ts
│   │       └── NewsIngestionPipeline.ts
│   ├── container.ts       # Injeção de dependências (prisma, cache)
│   ├── app.ts             # Configuração do Express + agendador de ingestão
│   └── server.ts          # Inicialização do servidor HTTP
│
├── .env.example
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## 📐 Convenções

### Organização

* **`routes/`** → define os endpoints e recebe as requisições HTTP.
* **`controllers/`** → contém a lógica de negócio de cada rota.
* **`config/`** → concentra configurações e variáveis de ambiente.
* **`lib/`** → concentra instâncias e dependências compartilhadas.
* **`services/newsIngestion/`** → pipeline de busca e persistência de notícias.
* **`app.ts`** → configura o Express e agenda a ingestão automática.
* **`server.ts`** → inicializa o servidor HTTP.

### Nomenclatura

* Arquivos → `camelCase` quando representarem módulos simples; `PascalCase` para classes.
* Rotas → nomes no plural para recursos (`users`, `news`).
* Variáveis e funções → `camelCase`.
* Tipos e interfaces → `PascalCase`.
* Constantes → `UPPER_SNAKE_CASE` quando forem constantes globais.

### Validação

A validação de entradas deve ser feita com **Zod** antes que os dados sejam processados pela aplicação ou enviados ao banco.

### Banco de dados

Alterações no schema devem ser realizadas através de **migrations do Prisma**, evitando alterações manuais no banco de desenvolvimento.
