# New News 📰

O **New News** centraliza notícias de diversas plataformas em um único lugar, mantendo você sempre atualizado com os conteúdos mais relevantes para o seu dia a dia.

---

## 📂 Estrutura do Repositório

Este projeto segue uma arquitetura de **monorepo**: cada módulo é completamente independente em sua própria pasta, com suas próprias dependências e configurações.

```text
newnews/
├── compose.yaml   # Orquestração de todos os serviços via Docker Compose
├── frontend/      # Aplicação web (React + Vite) → veja frontend/README.md
└── backend/       # API e integração de notícias → veja backend/README.md 
```

> Para entender a arquitetura, regras e como trabalhar em cada módulo, acesse o **README da pasta correspondente**.

---

## 🚀 Executando com Docker

A forma recomendada para rodar toda a aplicação é via Docker Compose, a partir da **raiz do projeto**:

```bash
docker compose up --build
```

| Serviço  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:8080 |
| Backend  | http://localhost:3000 |

---

## 🛠️ Desenvolvimento Local

Para trabalhar em um módulo isoladamente, **abra a pasta do módulo diretamente na sua IDE** — e não o repositório raiz. Isso garante que o ambiente de linguagem, linting e extensões funcionem corretamente para aquele contexto.

| Módulo   | Pasta a abrir  | README com instruções    |
| -------- | -------------- | ------------------------ |
| Frontend | `frontend/`    | `frontend/README.md`     |
| Backend  | `backend/`     | `backend/README.md`      |

## 📝 Documentação do Projeto

Acesse as diretrizes e informações detalhadas na [Página de Documentação do Google Docs](https://docs.google.com/document/d/1Od0Jk2iCSWuPcndsC8CK17pVPt1Q0ZtWUYIziVNl43c/edit?usp=drivesdk).

