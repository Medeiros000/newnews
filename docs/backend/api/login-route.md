> ⚠️ **STATUS: ESPECIFICAÇÃO DE BACKLOG FUTURO — AINDA NÃO IMPLEMENTADO NO BACKEND**  
> Este endpoint faz parte do planejamento da camada de autenticação e contas de usuário, conforme previsto nos requisitos do projeto, mas não está ativo na API atual.

---

# Rota de Login: `POST /api/auth/login`

Autentica um usuário cadastrado mediante e-mail e senha, retornando um token de acesso JWT e os dados básicos do perfil.

- **Método:** `POST`
- **Rota:** `/api/auth/login`
- **Autenticação:** Não necessária

---

## 1. Parâmetros do Corpo da Requisição (Body JSON)

| Campo | Tipo | Obrigatório | Regras |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Sim | Formato de e-mail válido. |
| `password` | `string` | Sim | Senha cadastrada do usuário. |

### Exemplo de Requisição
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "SenhaSegura123!"
}
```

### Exemplo com cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "SenhaSegura123!"
  }'
```

---

## 2. Resposta de Sucesso Planejada (`200 OK`)

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

- **`400 Bad Request`**: Dados ausentes ou formato inválido.
- **`401 Unauthorized`**: E-mail ou senha incorretos.
- **`404 Not Found`**: Usuário não encontrado no sistema.

---

## 4. Fluxograma Conceitual da Rota

<img src="diagrams/login-diagram.svg" height="800">
