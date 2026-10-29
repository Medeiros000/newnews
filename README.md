# New News 📰

O **New News** centraliza notícias de diversas plataformas em um único lugar, mantendo você sempre atualizado com os conteúdos mais relevantes para o seu dia a dia.

---

## 📂 Estrutura do Repositório

Este projeto segue uma arquitetura de **monorepo**: cada módulo é completamente independente em sua própria pasta, com suas próprias dependências e configurações.

```text
newnews/
├── compose.yaml      # Orquestração de todos os serviços (Frontend, Backend, Postgres, Redis)
├── chain.md          # Arquitetura e funcionamento do padrão Chain of Responsibility
├── logs.md           # Funcionamento do sistema centralizado de logs e tabela no banco
├── apresentacao.md   # Material explicativo sobre padrões de projeto e POO
├── frontend/         # Aplicação web React + Vite (veja frontend/README.md)
└── backend/          # API REST, ingestão e persistência (veja backend/README.md)
```

> Para entender a arquitetura, regras e como trabalhar em cada módulo, acesse o **README da pasta correspondente**.

---

## 🚀 Executando com Docker

A forma recomendada para rodar toda a aplicação é via Docker Compose, a partir da **raiz do projeto**:

```bash
docker compose up --build
```

### Serviços Disponíveis:

| Serviço    | URL / Porta             | Descrição                                      |
| ---------- | ----------------------- | ---------------------------------------------- |
| Frontend   | `http://localhost:8080` | Interface do usuário (React + Vite)            |
| Backend    | `http://localhost:3000` | API REST (Node.js + Express + TypeScript)      |
| PostgreSQL | `localhost:5432`        | Banco de dados relacional principal            |
| Redis      | `localhost:6379`        | Armazenamento de cache em memória              |

---

## 🛠️ Desenvolvimento Local

Para trabalhar em um módulo isoladamente, **abra a pasta do módulo diretamente na sua IDE** — e não o repositório raiz. Isso garante que o ambiente de linguagem, linting e extensões funcionem corretamente para aquele contexto.

| Módulo   | Pasta a abrir  | README com instruções    |
| -------- | -------------- | ------------------------ |
| Frontend | `frontend/`    | `frontend/README.md`     |
| Backend  | `backend/`     | `backend/README.md`      |

---

## 📚 Documentação Adicional

- **[Chain of Responsibility (`chain.md`)](chain.md):** Detalhamento da cadeia de handlers de ingestão de notícias (`FetchNewsHandler`, `NormalizationHandler`, `ValidationHandler`, `DeduplicationHandler`, `NewsInsertionHandler`, `CacheEvictionHandler`, `NewsSchedulerHandler`).
- **[Sistema de Logs (`logs.md`)](logs.md):** Guia do sistema centralizado de logs com persistência assíncrona na tabela `logs` do PostgreSQL.
- **[Apresentação de Padrões (`apresentacao.md`)](apresentacao.md):** Discussão pedagógica sobre Chain of Responsibility, Command, Encapsulamento e Segregação de Interfaces (ISP).
- **[Página de Documentação do Google Docs](https://docs.google.com/document/d/1Od0Jk2iCSWuPcndsC8CK17pVPt1Q0ZtWUYIziVNl43c/edit?usp=drivesdk):** Diretrizes e requisitos gerais do projeto.
