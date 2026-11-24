# Rotas de Categorias: `/api/categories`

Documentação dos endpoints de categorias do New News. Utilizados para alimentar a barra de navegação (Navbar), menus laterais (Sidebar) e opções de filtros por categoria.

---

## 1. Listar Categorias

Retorna a lista de todas as categorias cadastradas no banco de dados.

- **Método:** `GET`
- **Rota:** `/api/categories`
- **Autenticação:** Não necessária

### Parâmetros da Query String
*Nenhum.*

### Exemplo de Requisição
```http
GET /api/categories HTTP/1.1
Host: localhost:3000
Accept: application/json
```

### Exemplo com cURL
```bash
curl -X GET "http://localhost:3000/api/categories"
```

### Resposta de Sucesso (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "c1f7a0b5-78e2-45e3-982e-9d8a1c6e1001",
      "name": "general",
      "label": "Geral",
      "icon": "U+1F4F0"
    },
    {
      "id": "c1f7a0b5-78e2-45e3-982e-9d8a1c6e1002",
      "name": "science_technology",
      "label": "Tecnologia",
      "icon": "U+1F4BB"
    },
    {
      "id": "c1f7a0b5-78e2-45e3-982e-9d8a1c6e1003",
      "name": "sport",
      "label": "Esportes",
      "icon": "U+1F3C0"
    }
  ]
}
```

### Respostas de Erro
- **`400 Bad Request`**: Falha na busca ou leitura do banco.
```json
{
  "message": "Erro ao buscar categorias."
}
```

---

## 2. Buscar Categoria por ID

Retorna os detalhes de uma categoria específica pelo seu identificador único.

- **Método:** `GET`
- **Rota:** `/api/categories/:id`
- **Autenticação:** Não necessária

### Parâmetros de Rota
| Parâmetro | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID) | Sim | Identificador único da categoria. |

### Exemplo de Requisição
```http
GET /api/categories/c1f7a0b5-78e2-45e3-982e-9d8a1c6e1002 HTTP/1.1
Host: localhost:3000
Accept: application/json
```

### Exemplo com cURL
```bash
curl -X GET "http://localhost:3000/api/categories/c1f7a0b5-78e2-45e3-982e-9d8a1c6e1002"
```

### Resposta de Sucesso (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "c1f7a0b5-78e2-45e3-982e-9d8a1c6e1002",
    "name": "science_technology",
    "label": "Tecnologia",
    "icon": "U+1F4BB"
  }
}
```

### Respostas de Erro
- **`400 Bad Request`**: Categoria não encontrada ou erro interno de consulta.
```json
{
  "message": "Categoria não encontrada."
}
```

---

## 3. Fluxograma da Rota

Diagrama de fluxo da listagem de categorias para preenchimento da interface do usuário:

<img src="diagrams/categories-diagram.svg" height="800">
