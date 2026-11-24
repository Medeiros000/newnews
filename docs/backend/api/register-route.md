> ⚠️ **STATUS: ESPECIFICAÇÃO DE BACKLOG FUTURO — AINDA NÃO IMPLEMENTADO NO BACKEND**  
> Este endpoint faz parte do planejamento da camada de autenticação e contas de usuário, conforme previsto nos requisitos do projeto, mas não está ativo na API atual.

---

# Rota de Cadastro de Usuário: `POST /api/auth/register`

Cria uma nova conta de usuário no sistema com criptografia de senha e retorna a sessão inicial autenticada com token JWT.

- **Método:** `POST`
- **Rota:** `/api/auth/register`
- **Autenticação:** Não necessária

---

## 1. Parâmetros do Corpo da Requisição (Body JSON)

| Campo | Tipo | Obrigatório | Regras |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Sim | Nome completo (mínimo 2 caracteres). |
| `email` | `string` | Sim | E-mail válido e único no sistema. |
| `password` | `string` | Sim | Senha de acesso (mínimo 6 caracteres). |

### Exemplo de Requisição
```http
POST /api/auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "SenhaSegura123!"
}
```

### Exemplo com cURL
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "password": "SenhaSegura123!"
  }'
```

---

## 2. Resposta de Sucesso Planejada (`201 Created`)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 3. Respostas de Erro Planejadas

- **`400 Bad Request`**: Campos inválidos ou malformados.
- **`409 Conflict`**: E-mail já cadastrado anteriormente.

---

## 4. Fluxograma Conceitual da Rota

<img src="diagrams/register-diagram.svg" height="800">
