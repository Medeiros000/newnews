# New News 📰

O **New News** centraliza notícias de diversas plataformas em um único lugar, mantendo você sempre atualizado com os conteúdos mais relevantes para o seu dia a dia.

---

## 📂 Estrutura do Repositório

Este projeto segue uma arquitetura de **monorepo**: cada módulo é completamente independente em sua própria pasta, com suas próprias dependências e configurações.

```text
newnews/
├── compose.yaml   # Orquestração de todos os serviços via Docker Compose (App + Redis)
├── frontend/      # Aplicação web (React 19 + Vite) → veja frontend/README.md
├── backend/       # API REST e worker de notícias → veja backend/README.md 
└── docs/          # Especificações completas, arquitetura e contratos → veja docs/README.md
```

> Para entender a arquitetura, regras e como trabalhar em cada módulo, acesse o **README da pasta correspondente**.

---

## 🚀 Executando com Docker

A forma recomendada para rodar toda a aplicação com suas dependências é via Docker Compose, a partir da **raiz do projeto**:

```bash
docker compose up --build
```

| Serviço  | URL / Acesso           | Descrição |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:8080](http://localhost:8080) | Aplicação web interativa (React SPA). |
| **Backend**  | [http://localhost:3000](http://localhost:3000) | Servidor da API REST. |
| **Redis**    | `localhost:6379`       | Banco em memória para cache de notícias. |

---

## 🛠️ Desenvolvimento Local

Para trabalhar em um módulo isoladamente, **abra a pasta do módulo diretamente na sua IDE** — e não o repositório raiz. Isso garante que o ambiente de linguagem, linting e extensões funcionem corretamente para aquele contexto.

| Módulo | Pasta a abrir | README com instruções |
| :--- | :--- | :--- |
| **Frontend** | `frontend/` | [frontend/README.md](./frontend/README.md) |
| **Backend** | `backend/` | [backend/README.md](./backend/README.md) |

---

## 📚 Documentação do Projeto

O planejamento detalhado, diagramas e contratos arquiteturais estão centralizados no diretório [`docs/`](./docs/README.md):

- 🏛️ **[Visão de Produto e Fundação](./docs/New%20News%20-%20Documentação%20do%20Projeto.md):** Requisitos originais, escopo e diretrizes de trabalho do time.
- 📖 **[Índice Geral de Documentação](./docs/README.md):** Contratos de API do backend, modelagem de banco de dados, fluxo de ingestão e arquitetura do frontend.
