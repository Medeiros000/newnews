<div align="center">

# 📰 New News
### O feed de notícias auto-atualizado, moderno e de alto rendimento.

[![CI Status](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](../../.github/workflows/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

<p align="center">
  Uma plataforma completa para leitura de notícias com ingestão automática de conteúdo, cache em memória, interface responsiva e foco na clareza da informação.
</p>

</div>

---

## 💡 Visão de Produto

O **New News** foi projetado para resolver o ruído e a lentidão dos portais de notícias convencionais:

- **Feed Dinâmico e Contínuo:** Ingestão automática em background consumindo a Currents API.
- **Categorização Eficiente:** Artigos classificados por tópicos como Tecnologia, Games, Política, Economia e Esportes.
- **Leitura Fluida:** Busca de notícias instantânea, modo escuro/claro integrado e sistema de favoritos.
- **Arquitetura Resiliente:** Cache Redis para respostas ultrarrápidas da API e persistência confiável em SQLite com Prisma.

---

## 📂 Arquitetura do Repositório (Monorepo)

O repositório é organizado para permitir o desenvolvimento independente e a integração contínua:

```text
newnews/
├── .github/          # Workflows de CI para validação automática de PRs
├── frontend/         # Aplicação SPA em React 19 + Vite (veja frontend/README.md)
├── backend/          # API REST Node.js/TS + Worker de ingestão (veja backend/README.md)
├── infra/            # Infraestrutura como código (Render blueprint render.yaml)
├── docs/             # Central de documentação, contratos e modelagem de dados
├── compose.yaml      # Orquestração do ambiente completo via Docker Compose
└── LICENSE           # Licença MIT
```

> **Dica de desenvolvimento:** Para programar no Frontend ou Backend, abra a pasta do módulo diretamente na sua IDE para garantir o funcionamento correto de linter, testes e tipagem.

---

## 🚀 Como Executar

### Ambiente Completo (Docker Compose)
Para subir todos os serviços de uma vez (recomendado):

```bash
docker compose up --build
```

Acesse:
- **Aplicação Web:** [http://localhost:8080](http://localhost:8080)
- **API REST:** [http://localhost:3000](http://localhost:3000)
- **Instância Redis:** `localhost:6379`

### Desenvolvimento Isolado dos Módulos

| Módulo | Como rodar localmente | Guia Completo |
| :--- | :--- | :--- |
| **Frontend** | `cd frontend && npm i && npm run dev` | [frontend/README.md](../../frontend/README.md) |
| **Backend** | `cd backend && npm i && npm run dev` | [backend/README.md](../../backend/README.md) |

---

## 🛠️ DevOps, CI/CD e Infraestrutura

- **GitHub Actions (`.github/workflows/`):** Pipelines automatizados que validam cada PR enviado para `develop` ou `main`:
  - `frontend-ci.yaml`: Checagem de tipagem, linting com Oxlint, build e testes com Vitest.
  - `backend-ci.yaml`: Checagem de linter, validação do schema Prisma e testes com Jest.
- **Deploy em Nuvem (`infra/`):** O arquivo [`infra/render.yaml`](../../infra/render.yaml) orquestra a implantação do frontend e do backend em contêineres Docker na nuvem do Render.

---

## 📚 Central de Documentação

Para aprofundar na engenharia e nas decisões do projeto, visite a pasta [`docs/`](../../docs/README.md):
- 🏛️ [Fundação e Regras de Negócio](../../docs/New%20News%20-%20Documentação%20do%20Projeto.md)
- 🔌 [Especificações de Rotas e Endpoints](../../docs/backend/api/news-route.md)
- 🗄️ [Modelagem de Dados e Relacionamentos (ER)](../../docs/backend/er_docs/er_doc.md)
- 💻 [Arquitetura de Componentes e Estado](../../docs/frontend/arquitetura.md)

---

## 👥 Autores

Desenvolvido orginalmente por: **Vinícius** • **Júnior** • **Jair** • **Thais** • **João**

Licença [MIT](../../LICENSE).
