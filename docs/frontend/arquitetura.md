# Arquitetura do Frontend — New News

Documentação da arquitetura, organização de pastas, páginas e componentes da aplicação web do New News.

---

## 1. Visão Geral da Stack

A aplicação web é construída com foco em simplicidade, desempenho e reatividade:

| Camada | Tecnologia | Função |
| :--- | :--- | :--- |
| **Biblioteca UI** | React 19 | Criação e renderização da interface baseada em componentes funcionais. |
| **Bundler / Tooling** | Vite | Servidor de desenvolvimento rápido e empacotamento de produção. |
| **Roteamento** | React Router DOM 7 | Gerenciamento de rotas e navegação client-side SPA. |
| **Estado Global** | Zustand 5 | Stores atômicas e leves para estado compartilhado e persistência. |
| **Comunicação HTTP** | Axios | Cliente HTTP para consumo dos endpoints da API backend. |
| **Estilização** | Bootstrap 5 + CSS puro | Sistema de grid, utilitários visuais e estilos modulares por componente. |
| **Ícones** | Tabler Icons React | Biblioteca de ícones SVG leves e configuráveis. |
| **Testes** | Vitest | Execução de testes unitários para schemas, stores e utils. |

---

## 2. Estrutura de Diretórios (`frontend/src/`)

```text
src/
├── components/       # Componentes de interface (cada um com seu .jsx, .css e index.js)
├── hooks/            # Custom hooks com lógica reutilizável (ex.: useNewsFeed)
├── pages/            # Componentes de página vinculados às rotas do sistema
├── schemas/          # Schemas de validação de formulários (Zod)
├── services/         # Camada de comunicação HTTP desacoplada (Axios)
├── stores/           # Gerenciamento de estado global com Zustand
├── utils/            # Utilitários puros (configurações, formatação de datas)
├── App.jsx           # Componente raiz e definição das rotas do React Router
├── index.css         # Variáveis CSS globais, reset e temas
└── main.jsx          # Ponto de entrada que monta o React no DOM
```

---

## 3. Roteamento e Páginas

O roteamento é centralizado no arquivo `src/App.jsx` utilizando o `BrowserRouter` e `Routes`:

| Rota | Componente de Página | Finalidade |
| :--- | :--- | :--- |
| `/` | `HomePage` | Página inicial com feed principal de notícias, card hero de destaque, filtros por categoria e busca textual. |
| `/news` | `NewsPage` | Visualização detalhada do artigo selecionado, informações do autor, fonte original e seção de notícias relacionadas. |
| `/config` | `ConfigPage` | Painel de preferências do usuário (alternância de tema claro/escuro, visualização compacta e opções de interface). |
| `/register` | `RegisterPage` | Formulário de criação de conta com validação de campos (nome, e-mail e senha). |
| `/login` | `LoginPage` | Formulário de autenticação de usuários cadastrados. |

---

## 4. Componentes Principais

Os componentes seguem o padrão de pasta dedicada contendo o JSX, seu CSS modular e um barrel `index.js`:

- **`Navbar`**: Barra de navegação superior fixa com barra de pesquisa instantânea (com debounce), botão de alternância de tema e atalhos de autenticação.
- **`Sidebar`**: Menu lateral retrátil contendo a lista de categorias dinâmicas carregadas da API, permitindo filtrar o feed com um clique.
- **`NewsCard`**: Card reutilizável de notícia. Exibe imagem, selo de categoria, título, descrição, autor, data relativa (`timeAgo`) e botões de ação (favoritar e copiar link com toast feedback).
- **`ToastContainer`**: Gerenciador visual de notificações temporárias (ex.: "Notícia salva nos favoritos", "Link copiado").
- **`ErrorBoundary`**: Proteção da árvore de renderização do React contra falhas inesperadas na interface.
- **`EmptyState`**: Exibição elegante e contextual quando nenhuma notícia é encontrada para uma busca ou filtro.

---

## 5. Convenções de Desenvolvimento

1. **Imports via Alias:** Utilizar sempre `@/` para referenciar módulos dentro de `src/` (ex.: `import { newsService } from '@/services'`).
2. **Exportações Nomeadas:** Evitar `export default`; preferir sempre exportações nomeadas (`export function NewsCard(...)`).
3. **Barrels de Módulo:** Cada pasta (`components/`, `stores/`, `services/`) possui um `index.js` para centralizar as exportações do diretório.
