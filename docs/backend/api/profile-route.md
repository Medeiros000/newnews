> ⚠️ **STATUS: ESPECIFICAÇÃO DE BACKLOG FUTURO — AINDA NÃO IMPLEMENTADO NO BACKEND**  
> Este endpoint faz parte do planejamento da camada de perfil e preferências do usuário autenticado, mas não está ativo na API atual.

---

# Rota de Perfil: `GET /api/user/profile`

Retorna as informações cadastrais e preferências do usuário logado através do token de autenticação enviado no header.

- **Método:** `GET`
- **Rota:** `/api/user/profile`
- **Autenticação:** Requerida (`Bearer Token`)

---

## 1. Headers da Requisição

| Header | Valor | Obrigatório |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <token_jwt>` | Sim |

### Exemplo de Requisição
```http
GET /api/user/profile HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

---

## 2. Resposta de Sucesso Planejada (`200 OK`)

```json
{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "avatar": null
  }
}
```

---

## 3. Respostas de Erro Planejadas

- **`401 Unauthorized`**: Token ausente, expirado ou com assinatura inválida.
- **`404 Not Found`**: Usuário associado ao token não encontrado.

---

## 4. Fluxograma Conceitual da Rota

<img src="diagrams/profile-diagram.svg" height="800">
