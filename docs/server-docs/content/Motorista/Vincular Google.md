Endpoint autenticado para vincular a conta do Google à conta do motorista atualmente logado.

## Rota URL

- Rota: /motorista/google/vincular
- Tipo: POST
- _Nota: Rota protegida. Necessário o cookie `token` de autenticação._

## Dados Esperados

- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
- **Corpo (Body)**:
  - "token": String, ID Token JWT fornecido pelo SDK do Google

#### Exemplo

```JSON
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

## Respostas

- "msg": mensagem informando o resultado da vinculação.

#### Exemplo

```JSON
{
  "msg": "Conta vinculada ao google com sucesso."
}
```

## Status

- 200: Conta vinculada ao Google com sucesso
- 400: Token do Google ausente ou inválido no corpo da requisição
- 401: Token JWT de sessão ausente/inválido OU token do Google inválido/expirado
- 403: Conta não verificada no Movan OU e-mail da conta Google não verificado
- 409: Esta conta do Google já está vinculada a outro usuário
- 500: Erro interno no servidor
