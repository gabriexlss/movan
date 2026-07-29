Endpoint autenticado para enviar o código de verificação ao novo e-mail antes de alterá-lo.

- Rota: /motorista/editar/enviar-codigo
- Método: POST
- Cookie: `token` configurado

Corpo da requisição:

```json
{
  "email": "novoemail@exemplo.com"
}
```

- 200: Código enviado com sucesso.
- 400: E-mail inválido.
- 401: Token de autenticação ausente ou inválido.
- 403: Conta não verificada.
- 409: E-mail já cadastrado.
- 500: Erro interno ao enviar o código.
