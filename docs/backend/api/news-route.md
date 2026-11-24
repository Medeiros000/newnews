# Rotas de Notícias: `/api/news`

Documentação completa dos endpoints de consulta, detalhamento e busca de notícias. As notícias são armazenadas no SQLite e possuem suporte a cache Redis com expiração configurada.

---

## 1. Listar Notícias (Feed Principal e Filtros)

Retorna notícias ordenadas por data de publicação (`published_at desc`), com suporte a paginação e filtros opcionais por texto e categoria.

- **Método:** `GET`
- **Rota:** `/api/news`
- **Autenticação:** Não necessária

### Parâmetros da Query String
| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `query` | `string` | — | Busca textual no título (`title`) e na descrição (`description`). |
| `q` | `string` | — | Alias alternativo para `query`. |
| `category` | `string` | — | Nome da categoria cadastrada (ex.: `science_technology`, `sport`, `general`). |
| `page` | `number` | `1` | Número da página desejada (mínimo 1). |
| `limit` | `number` | `10` | Quantidade de registros por página. |

### Exemplos de Requisição
```http
GET /api/news HTTP/1.1
GET /api/news?category=science_technology HTTP/1.1
GET /api/news?query=inteligencia&page=1&limit=12 HTTP/1.1
```

### Exemplos com cURL
```bash
curl "http://localhost:3000/api/news"
curl "http://localhost:3000/api/news?category=science_technology"
curl "http://localhost:3000/api/news?query=inteligencia&page=1&limit=12"
```

### Resposta de Sucesso (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "e9b276b5-095a-4cb6-b25f-fcbe1e6eb901",
      "category_id": "c1f7a0b5-78e2-45e3-982e-9d8a1c6e1002",
      "title": "Avanços em Inteligência Artificial no mercado de desenvolvimento",
      "description": "Novo modelo promete automatizar tarefas repetitivas com alta precisão e velocidade.",
      "url": "https://exemplo.com/noticias/avancos-em-ia",
      "author": "Redação Tech",
      "image_url": "https://exemplo.com/imagens/ia.jpg",
      "language": "pt-BR",
      "source": "Portal Tech",
      "published_at": "2026-11-23T18:00:00.000Z"
    }
  ]
}
```

---

## 2. Buscar Notícias (Alias `/search`)

Atua como um alias direto para a rota principal de listagem, aceitando os mesmos parâmetros.

- **Método:** `GET`
- **Rota:** `/api/news/search`
- **Autenticação:** Não necessária
- **Parâmetros:** Idênticos a `GET /api/news`.

```bash
curl "http://localhost:3000/api/news/search?query=tecnologia"
```

---

## 3. Detalhes de uma Notícia

Retorna as informações completas de um artigo individual identificado pelo seu `id`.

- **Método:** `GET`
- **Rota:** `/api/news/:id`
- **Autenticação:** Não necessária

### Parâmetros de Rota
| Parâmetro | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID) | Sim | Identificador único da notícia. |

### Exemplo de Requisição
```http
GET /api/news/e9b276b5-095a-4cb6-b25f-fcbe1e6eb901 HTTP/1.1
```

### Exemplo com cURL
```bash
curl "http://localhost:3000/api/news/e9b276b5-095a-4cb6-b25f-fcbe1e6eb901"
```

### Resposta de Sucesso (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "e9b276b5-095a-4cb6-b25f-fcbe1e6eb901",
    "category_id": "c1f7a0b5-78e2-45e3-982e-9d8a1c6e1002",
    "title": "Avanços em Inteligência Artificial no mercado de desenvolvimento",
    "description": "Novo modelo promete automatizar tarefas repetitivas com alta precisão e velocidade.",
    "url": "https://exemplo.com/noticias/avancos-em-ia",
    "author": "Redação Tech",
    "image_url": "https://exemplo.com/imagens/ia.jpg",
    "language": "pt-BR",
    "source": "Portal Tech",
    "published_at": "2026-11-23T18:00:00.000Z"
  }
}
```

### Respostas de Erro
- **`404 Not Found`**: Notícia inexistente no banco de dados.
```json
{
  "success": false,
  "error": "Notícia não encontrada"
}
```

---

## 4. Notícias Relacionadas

Retorna artigos recentes pertencentes à mesma categoria da notícia de referência, excluindo o próprio artigo.

- **Método:** `GET`
- **Rota:** `/api/news/:id/related`
- **Autenticação:** Não necessária

### Parâmetros de Rota e Query
| Parâmetro | Onde | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | Path | `string` (UUID) | — | Identificador da notícia de referência. |
| `limit` | Query | `number` | `4` | Quantidade máxima de artigos relacionados a retornar. |

### Exemplo de Requisição
```http
GET /api/news/e9b276b5-095a-4cb6-b25f-fcbe1e6eb901/related?limit=3 HTTP/1.1
```

### Exemplo com cURL
```bash
curl "http://localhost:3000/api/news/e9b276b5-095a-4cb6-b25f-fcbe1e6eb901/related?limit=3"
```

### Resposta de Sucesso (`200 OK`)
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": "f8a192c3-124b-4a5b-912c-0e1d2f3a4b02",
        "category_id": "c1f7a0b5-78e2-45e3-982e-9d8a1c6e1002",
        "title": "Outra notícia da categoria de tecnologia",
        "description": "Resumo complementar sobre inovações tecnológicas.",
        "url": "https://exemplo.com/noticias/outra-noticia-tech",
        "author": "Equipe Editorial",
        "image_url": "https://exemplo.com/imagens/tech2.jpg",
        "language": "pt-BR",
        "source": "Portal Tech",
        "published_at": "2026-11-23T16:30:00.000Z"
      }
    ]
  }
}
```

### Respostas de Erro
- **`404 Not Found`**: Caso a notícia de referência (`:id`) não exista.
```json
{
  "success": false,
  "error": "Notícia não encontrada"
}
```

---

## 5. Fluxograma das Rotas

Fluxo de requisição das rotas de notícias, abrangendo checagem de cache Redis, consulta ao SQLite e retorno:

<img src="diagrams/news-diagram.svg" height="900">
