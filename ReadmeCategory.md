# ReadmeCategory

## Objetivo

Esta branch adiciona o fluxo de consulta de categorias à API, usando Prisma como
fonte de dados, Redis como cache e uma estrutura orientada a objetos para o
controller, mapper e router.

## Mudanças realizadas

### Model de categoria

O model [`Category`](backend/src/models/Category.ts) representa a categoria
exposta pela aplicação com os campos:

- `id`
- `label`
- `icon`

### Mapper

O [`CategoryMapper`](backend/src/mappers/CategoryMapper.ts) converte o registro
gerado pelo Prisma em uma instância do model `Category`.

Isso mantém a estrutura retornada pela API separada da estrutura interna do
Prisma.

### Controller

O [`CategoryController`](backend/src/controllers/CategoryController.ts) consulta
diretamente o Prisma e possui dois handlers:

- `get`: lista todas as categorias com `prisma.category.findMany()`.
- `getById`: busca uma categoria pelo ID com `prisma.category.findUnique()`.

As respostas seguem o formato:

```json
{
  "success": true,
  "data": []
}
```

Quando uma categoria não é encontrada, a API retorna uma mensagem de erro.

### Cache

As consultas usam o serviço Redis disponível no container da aplicação.

| Consulta | Chave | TTL |
| --- | --- | --- |
| Lista de categorias | `categories:list` | 300 segundos |
| Categoria por ID | `categories:{id}` | 300 segundos |

O controller consulta o cache antes do banco e grava no cache o resultado
obtido do Prisma. Falhas do Redis não impedem o acesso ao banco, pois o
`RedisService` trata o cache como uma dependência não bloqueante.

### Router orientado a objetos

O [`CategoryRouter`](backend/src/routes/CategoryRouter.ts) foi implementado
como uma classe. Ele:

- cria ou recebe uma instância de `CategoryController`;
- cria o `Router` do Express;
- configura as rotas em um método privado;
- mantém o contexto dos handlers com `bind`.

O router é registrado pela aplicação em:

```text
/api/categories
```

### Integração com a aplicação

O [`App`](backend/src/app.ts) instancia `CategoryRouter` e registra suas rotas
junto às demais rotas da API.

## Endpoints

### Listar categorias

```http
GET /api/categories
```

### Buscar categoria por ID

```http
GET /api/categories/:id
```

## Prisma

O model `Category` do Prisma utiliza a tabela `categories` por meio de
`@@map("categories")`. O model `News` utiliza a tabela `news` por meio de
`@@map("news")`.

## Validação

O router e o controller foram validados com Oxlint. A compilação geral do
backend ainda depende da correção dos símbolos `getCache` e `setCache` no
`newsController`, que são problemas independentes deste fluxo de categorias.
