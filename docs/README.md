# 📚 Documentação do Projeto — New News

Bem-vindo à central de documentação e especificações do **New News**.

Este diretório atua como o **Plano, Especificação e Guia** do sistema. Ele define a arquitetura, modelos de dados, contratos de API e fluxos de funcionamento do projeto, orientando o desenvolvimento tanto nas funcionalidades já ativas quanto no backlog futuro.

---

## 🏛️ 1. Fundação e Visão de Produto

Para entender a proposta de valor, os requisitos originais de negócio e as regras de governança da equipe (padrões de branches, commits e fluxo de PRs):

- 📄 **[New News — Documentação do Projeto (Fundação)](./New%20News%20-%20Documentação%20do%20Projeto.md)**: A concepção inicial do projeto, requisitos funcionais e não-funcionais, e diretrizes de desenvolvimento do grupo.

---

## ⚙️ 2. Documentação do Backend (`docs/backend/`)

Especificações técnicas da API Node.js/Express, banco de dados e rotinas de ingestão:

- 🔌 **Contratos da API HTTP (`docs/backend/api/`):**
  - [Rotas de Categorias (`/api/categories`)](./backend/api/categories-route.md): Listagem e busca de categorias ativas.
  - [Rotas de Notícias (`/api/news`)](./backend/api/news-route.md): Feed, busca textual, detalhes e matérias relacionadas.
  - [Rota de Login (`/api/auth/login`)](./backend/api/login-route.md) *(Backlog)*: Especificação planejada de autenticação.
  - [Rota de Cadastro (`/api/auth/register`)](./backend/api/register-route.md) *(Backlog)*: Especificação planejada de novas contas.
  - [Rota de Perfil (`/api/user/profile`)](./backend/api/profile-route.md) *(Backlog)*: Especificação planejada do perfil autenticado.
- 🗄️ **[Modelo de Dados Relacional (ER)](./backend/er_docs/er_doc.md):** Estrutura de tabelas, campos, chaves primárias/estrangeiras e diagrama relacional.
- 📰 **[Pipeline de Ingestão de Notícias](./backend/news-collection/news-collection.md):** Fluxo de coleta automática via Currents API, normalização, validação, deduplicação e cache Redis.
- 🛠️ **[Guia de Criação de Rotas e Seeds](./backend/Criacao_de_rotas_e_seeds.md):** Tutorial prático da arquitetura POO (Router -> Controller -> Service -> Prisma) e execução dos scripts de seed.
- 📐 **[Normas e Padrões da API](./backend/Normas.md):** Diretrizes de design REST, convenções HTTP e boas práticas.

---

## 💻 3. Documentação do Frontend (`docs/frontend/`)

Guias orientativos sobre a aplicação web React:

- 🏛️ **[Arquitetura do Frontend](./frontend/arquitetura.md):** Visão geral da stack React 19 + Vite, árvore de componentes, roteamento com React Router DOM e convenções de código.
- 🔄 **[Gerenciamento de Estado e Serviços](./frontend/estado-e-servicos.md):** Stores reativas com Zustand (`bookmarks`, `navigation`, `theme`, `toast`, `user`), camada de serviços Axios (`newsService`, `userService`) e fluxo de dados.

---

## 📊 4. Matriz de Status das Funcionalidades

| Funcionalidade | Backend | Frontend | Banco de Dados | Status Atual |
| :--- | :---: | :---: | :---: | :--- |
| **Feed de Notícias e Filtros** | ✅ Ativo | ✅ Ativo | ✅ Ativo (`News`) | **100% Implementado** |
| **Categorias de Navegação** | ✅ Ativo | ✅ Ativo | ✅ Ativo (`Category`) | **100% Implementado** |
| **Busca de Notícias por Texto** | ✅ Ativo | ✅ Ativo | ✅ Ativo | **100% Implementado** |
| **Ingestão Automática (Worker)** | ✅ Ativo | — | ✅ Ativo | **100% Implementado** (Currents API + Redis) |
| **Favoritos (Bookmarks)** | ⏳ Backlog | ✅ Ativo (Local) | ⏳ Backlog | **Parcial** (Persistido no `localStorage` do cliente) |
| **Alternância de Tema (Dark/Light)**| — | ✅ Ativo | — | **100% Implementado** |
| **Cadastro de Usuários** | ⏳ Backlog | 🟡 Interface Pronta | ⏳ Backlog | **Planejado / Backlog Futuro** |
| **Login / Autenticação JWT** | ⏳ Backlog | 🟡 Interface Pronta | ⏳ Backlog | **Planejado / Backlog Futuro** |
| **Perfil e Preferências no Banco**| ⏳ Backlog | 🟡 Interface Pronta | ⏳ Backlog | **Planejado / Backlog Futuro** |
