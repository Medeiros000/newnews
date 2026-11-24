# Modelo de Dados (Entidade-Relacionamento)

Este documento descreve as tabelas e campos do banco de dados do New News, correspondentes ao diagrama [ER_diagram.svg](./diagrams/ER_diagram.svg).

> 📌 **Nota sobre o Estado de Implementação:**  
> - **Tabelas Implementadas (Fase Atual):** `CATEGORY` e `NEWS` estão ativas e em produção via Prisma ORM (`backend/prisma/schema.prisma`) com SQLite.  
> - **Tabelas Conceituais (Planejamento / Backlog Futuro):** As tabelas `USER`, `USER_PREFERENCE`, `USER_CATEGORY`, `NOTIFICATION`, `BOOKMARK` e `READ_ARTICLE` compõem o modelo relacional planejado para suportar contas de usuário, login, preferências personalizadas e favoritos em fases posteriores.

---

## 1. Visão Geral das Relações

- Uma categoria classifica várias notícias (`CATEGORY` 1:N `NEWS`).
- Um usuário possui um único registro de preferências (`USER` 1:1 `USER_PREFERENCE`).
- Usuários podem seguir várias categorias, e cada categoria pode ser seguida por vários usuários (`USER` N:N `CATEGORY` via `USER_CATEGORY`).
- Um usuário pode receber várias notificações geradas a partir de notícias (`USER` 1:N `NOTIFICATION` e `NEWS` 1:N `NOTIFICATION`).
- Um usuário pode salvar notícias em seus favoritos (`USER` N:N `NEWS` via `BOOKMARK`).
- Um usuário pode marcar notícias como lidas no histórico (`USER` N:N `NEWS` via `READ_ARTICLE`).

---

## 2. Tabelas do Sistema

### 2.1. Tabela `CATEGORY` (Ativa)

Armazena as categorias utilizadas para organizar o feed e filtrar as notícias.

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | `PK` | Identificador único da categoria (UUID v4). |
| `name` | `varchar(80)` | `UK` | Identificador textual único da categoria usado em queries (ex.: `science_technology`). |
| `label` | `varchar(80)` | — | Rótulo formatado para exibição na interface (ex.: `Tecnologia`). |
| `icon` | `varchar(16)` | — | Identificador do ícone Unicode ou Tabler (ex.: `U+1F4BB`). |

---

### 2.2. Tabela `NEWS` (Ativa)

Armazena os artigos e matérias ingeridos automaticamente da API externa.

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | `PK` | Identificador único da notícia (UUID v4). |
| `category_id` | `uuid` | `FK` | Chave estrangeira referenciando `CATEGORY.id`. |
| `title` | `varchar(255)` | — | Título principal da matéria. |
| `description` | `text` | — | Descrição resumida da notícia exibida nos cards e detalhes. |
| `url` | `varchar(2048)` | `UK` | URL original da matéria (usada também para deduplicação no salvamento). |
| `author` | `varchar(120)` | — | Nome do autor ou da equipe jornalística. |
| `image_url` | `varchar(2048)` | — | Endereço da imagem ilustrativa da notícia. |
| `language` | `varchar(10)` | — | Código do idioma do artigo (ex.: `pt-BR`). |
| `source` | `varchar(120)` | — | Veículo ou agência de comunicação de origem. |
| `published_at` | `datetime` | — | Data e hora em que a notícia foi publicada. |

---

### 2.3. Tabela `USER` *(Planejada / Backlog)*

Armazena os dados cadastrais básicos das contas de usuários.

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | `PK` | Identificador único do usuário. |
| `name` | `varchar(120)` | — | Nome completo do usuário. |
| `email` | `varchar(254)` | `UK` | E-mail único de acesso à conta. |
| `avatar_url` | `varchar(2048)` | — | URL da imagem de perfil do usuário. |

---

### 2.4. Tabela `USER_PREFERENCE` *(Planejada / Backlog)*

Registra as opções de personalização da experiência do usuário (tema visual, notificações e visualizações).

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `user_id` | `uuid` | `PK, FK` | Identifica o usuário e referencia `USER.id` (relação 1:1). |
| `email_notifications` | `boolean` | — | Se o usuário deseja receber alertas por e-mail. |
| `breaking_news` | `boolean` | — | Se o usuário deseja alertas de notícias urgentes. |
| `compact_view` | `boolean` | — | Preferência por layout condensado. |
| `show_read_articles` | `boolean` | — | Se notícias já lidas devem continuar aparecendo no feed. |
| `theme` | `varchar(10)` | — | Tema visual escolhido (`light` ou `dark`). |
| `updated_at` | `datetime` | — | Data e hora da última modificação das preferências. |

---

### 2.5. Tabela `USER_CATEGORY` *(Planejada / Backlog)*

Tabela de associação de relação N:N representando as categorias que o usuário segue.

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `user_id` | `uuid` | `PK, FK` | Referência ao usuário (`USER.id`). |
| `category_id` | `uuid` | `PK, FK` | Referência à categoria seguida (`CATEGORY.id`). |
| `created_at` | `datetime` | — | Data e hora em que começou a seguir a categoria. |

---

### 2.6. Tabela `NOTIFICATION` *(Planejada / Backlog)*

Armazena os avisos e alertas individuais direcionados a cada usuário.

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | `PK` | Identificador único da notificação. |
| `user_id` | `uuid` | `FK` | Usuário destinatário (`USER.id`). |
| `news_id` | `uuid` | `FK` | Notícia vinculada ao alerta (`NEWS.id`). |
| `created_at` | `datetime` | — | Data e hora de criação da notificação. |
| `read_at` | `datetime` | — | Data e hora de leitura (nulo enquanto não lida). |

---

### 2.7. Tabela `BOOKMARK` *(Planejada / Backlog)*

Registra as notícias favoritadas por cada usuário (atualmente gerenciado no cliente via Zustand/localStorage).

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `user_id` | `uuid` | `PK, FK` | Usuário que favoritou (`USER.id`). |
| `news_id` | `uuid` | `PK, FK` | Notícia favoritada (`NEWS.id`). |
| `created_at` | `datetime` | — | Data e hora em que foi salva. |

---

### 2.8. Tabela `READ_ARTICLE` *(Planejada / Backlog)*

Histórico de matérias lidas por cada usuário para controle de visualizações.

| Campo | Tipo | Chaves | Finalidade |
| :--- | :--- | :---: | :--- |
| `user_id` | `uuid` | `PK, FK` | Usuário que realizou a leitura (`USER.id`). |
| `news_id` | `uuid` | `PK, FK` | Notícia lida (`NEWS.id`). |
| `read_at` | `datetime` | — | Data e hora da leitura. |

---

## 3. Legenda das Chaves

- **PK (`Primary Key`)**: Chave primária. Identifica o registro de forma única.
- **FK (`Foreign Key`)**: Chave estrangeira. Estabelece integridade referencial com outra tabela.
- **UK (`Unique Key`)**: Chave única. Garante que não haja valores duplicados na coluna.
