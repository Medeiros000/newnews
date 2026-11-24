# Frontend — New News

Aplicação web do New News, construída com **React 19 + JavaScript + Vite**.

> **Antes de começar:** Abra a pasta `frontend/` diretamente na sua IDE (e não o repositório raiz). Isso garante que o IntelliSense, linting e resolução de aliases funcionem corretamente.

---

## 🚀 Primeiros Passos

Na pasta `frontend/`, instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em:
```text
http://localhost:5173
```
*(Quando executado via Docker Compose a partir da raiz, a aplicação é servida na porta 8080).*

---

## 🧰 Scripts Disponíveis

| Script | O que faz |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento (Vite). |
| `npm run build` | Compila os arquivos para produção no diretório `dist/`. |
| `npm run preview` | Pré-visualiza localmente o build de produção. |
| `npm test` | Executa os testes unitários uma vez com Vitest. |
| `npm run test:watch` | Executa os testes em modo interativo e contínuo. |
| `npm run lint` | Analisa problemas no código utilizando Oxlint. |
| `npm run format` | Formata automaticamente o código com Prettier. |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Interface (UI)** | React 19 |
| **Bundler** | Vite |
| **Roteamento** | React Router DOM 7 |
| **Estado Global** | Zustand 5 |
| **Cliente HTTP** | Axios |
| **Estilização** | Bootstrap 5 + CSS Puro |
| **Ícones** | Tabler Icons React |
| **Testes** | Vitest |
| **Linter / Formatador** | Oxlint / Prettier |

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `frontend/` se desejar customizar a URL da API backend:

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | URL base utilizada pelo Axios para comunicação com o backend. |

> Em desenvolvimento local separado (sem proxy), aponte para:  
> `VITE_API_BASE_URL=http://localhost:3000/api`

---

## 📂 Estrutura de Pastas

```text
frontend/src/
├── components/   # Componentes de interface (Navbar, Sidebar, NewsCard, ToastContainer, etc.)
├── hooks/        # Custom hooks reutilizáveis (useNewsFeed)
├── pages/        # Componentes de página (HomePage, NewsPage, ConfigPage, LoginPage, RegisterPage)
├── schemas/      # Schemas de validação de formulários (authSchema)
├── services/     # Serviços de integração HTTP com Axios (newsService, userService)
├── stores/       # Gerenciamento de estado global com Zustand (bookmarks, navigation, theme, toast, user)
├── utils/        # Configurações globais e funções utilitárias
├── App.jsx       # Componente raiz e definição das rotas do React Router
├── index.css     # Estilos globais e reset
└── main.jsx      # Ponto de entrada que inicializa a aplicação no DOM
```

---

## 📐 Convenções de Código

### 1. Imports com Alias `@/`
Utilize sempre o alias `@/` apontando para `src/`. Em importações entre módulos, utilize os barrels (`index.js`):

```js
// ✅ Correto
import { useNavigationStore } from '@/stores';
import { Navbar } from '@/components/Navbar';

// ❌ Evitar
import { useNavigationStore } from '../../stores/navigationStore.js';
```

### 2. Nomenclatura e Exportações
- **Componentes:** Use `PascalCase` e utilize exportações nomeadas (`export function NewsCard(...)`).
- **Hooks:** Use o prefixo `use` (`useNewsFeed.js`).
- **Stores:** Use o sufixo `Store` (`themeStore.js`).
- **Serviços:** Use o sufixo `Service` (`newsService.js`).

---

## 📖 Documentação Adicional

Para entender a arquitetura completa dos componentes, o gerenciamento de stores no Zustand e o fluxo de dados com a API, consulte a documentação técnica:

- 🏛️ **[Arquitetura do Frontend](../docs/frontend/arquitetura.md)**
- 🔄 **[Gerenciamento de Estado e Serviços](../docs/frontend/estado-e-servicos.md)**
