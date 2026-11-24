# Gerenciamento de Estado e Camada de Serviços — Frontend

Este documento descreve como o frontend do New News gerencia o estado global da aplicação e organiza a comunicação com a API backend.

---

## 1. Gerenciamento de Estado Global (Zustand)

O estado global utiliza a biblioteca **Zustand**, organizada em stores pequenas e desacopladas em `src/stores/`. Cada store possui um arquivo com sufixo `Store.js` e métodos claros para atualização de estado:

### 1.1. `navigationStore` (`navigationStore.js`)
- **Responsabilidade:** Controla a categoria atualmente selecionada e a listagem de itens de menu carregados da API.
- **Ações principais:**
  - `loadNavigation()`: Dispara a busca de categorias em `newsService.getCategories()` e monta os itens de navegação (com o item padrão "Início/Todos").
  - `setActiveCategory(category)`: Define a categoria ativa do filtro do feed.

### 1.2. `bookmarksStore` (`bookmarksStore.js`)
- **Responsabilidade:** Gerencia as notícias salvas pelo usuário como favoritas.
- **Persistência:** Utiliza o middleware `persist` do Zustand para salvar os favoritos diretamente no `localStorage` do navegador, mantendo os dados mesmo após recarregar a página.
- **Ações principais:**
  - `toggleBookmark(article)`: Adiciona ou remove a notícia dos favoritos com feedback sonoro/visual via toast.
  - `isBookmarked(id)`: Verifica se um artigo específico já está salvo.

### 1.3. `themeStore` (`themeStore.js`)
- **Responsabilidade:** Gerencia o tema visual da interface (`light` ou `dark`).
- **Persistência:** Salva a preferência no `localStorage` e injeta dinamicamente o atributo `data-bs-theme` na tag raiz `<html>`.
- **Ações principais:**
  - `toggleTheme()`: Alterna entre os modos claro e escuro.

### 1.4. `toastStore` (`toastStore.js`)
- **Responsabilidade:** Controla a exibição e o auto-dismiss de mensagens flutuantes temporárias (toasts) na interface.
- **Ações principais:**
  - `addToast(message, type, icon)`: Enfileira uma nova mensagem temporária.
  - `removeToast(id)`: Remove a notificação da fila.

### 1.5. `userStore` (`userStore.js`)
- **Responsabilidade:** Mantém o estado da sessão do usuário no cliente (dados básicos do usuário logado e token de acesso).
- **Ações principais:**
  - `setUser(user)`: Armazena a sessão ativa.
  - `logout()`: Limpa os dados do usuário e encerra a sessão.

---

## 2. Camada de Serviços HTTP (Axios)

Toda a comunicação com a API backend é isolada na pasta `src/services/` através do padrão Facade, evitando que componentes React façam chamadas `fetch` ou `axios` diretamente.

A URL base da API é configurada centralizadamente em `src/utils/config.js` através da variável de ambiente `VITE_API_BASE_URL` (com fallback para `/api`).

### 2.1. `newsService` (`newsService.js`)

Centraliza as operações de consulta e leitura de notícias:

| Método | Endpoint Chamado | Finalidade |
| :--- | :--- | :--- |
| `getNews(params)` | `GET /news` | Busca feed paginado e filtrado (aceita `query`, `category`, `page`, `limit`). Trata automaticamente a categoria 'Todos'. |
| `getNewsById(id)` | `GET /news/:id` | Retorna os detalhes de um artigo específico. |
| `getCategories()` | `GET /categories` | Busca as categorias cadastradas para preencher Navbar e Sidebar. |
| `getRelatedNews(id, params)` | `GET /news/:id/related` | Busca matérias relacionadas. Possui lógica de resiliência: se o endpoint falhar, busca automaticamente outras notícias da mesma categoria via `/news`. |

### 2.2. `userService` (`userService.js`)

Centraliza os endpoints de autenticação e contas:

| Método | Endpoint Chamado | Status de Integração |
| :--- | :--- | :--- |
| `login(credentials)` | `POST /auth/login` | *Aguardando implementação no backend.* Envia e-mail e senha. |
| `register(userData)` | `POST /auth/register` | *Aguardando implementação no backend.* Envia nome, e-mail e senha. |

---

## 3. Fluxo de Dados na Interface (Exemplo de Consulta de Notícias)

```text
Componente (HomePage)
       │
       ▼
useNewsFeed (Hook)
       │  Lê categoria ativa de 'useNavigationStore'
       ▼
newsService.getNews({ category, query, page })
       │
       ▼  Axios GET /api/news
Backend API (Express + Prisma + Redis Cache)
       │
       ▼  Retorno { success: true, data: [...] }
Atualização do estado local no hook → Renderização nos NewsCards
```
