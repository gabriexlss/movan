Endpoint público para realizar a autenticação do motorista utilizando o token do Google OAuth2.
## Rota URL
- Rota: /motorista/google
- Tipo: POST
- *Nota 1: Endpoint público, não exige cookie de autenticação prévio.*
- *Nota 2: Se a conta vinculada estiver agendada para exclusão (soft delete), o login bem-sucedido via Google cancela o agendamento de exclusão automaticamente.*
## Dados Esperados
- **Corpo (Body)**:
  - "token": String, ID Token JWT fornecido pelo SDK do Google
#### Exemplo
``` JSON
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```
## Respostas
- **Caso 1 (Conta Google vinculada encontrada)**:
  Retorna status 200, mensagem de sucesso e define o cookie HTTP-only `token` (cancela agendamento de exclusão se houver).
  ``` JSON
  {
    "msg": "Login realizado com sucesso."
  }
  ```
- **Caso 2 (Conta encontrada por e-mail, mas não vinculada ao Google)**:
  Retorna status 409 informando que o e-mail já existe sem vínculo com o Google.
  ``` JSON
  {
    "msg": "Conta Encontrada, mas não vinculada ao google."
  }
  ```
- **Caso 3 (Conta não encontrada por ID Google nem por E-mail)**:
  Retorna status 200 sinalizando que a criação de conta é necessária.
  ``` JSON
  {
    "msg": "Conta não encontrada. iniciando criação de conta com o google.",
    "CREATION_REQUIRED": true,
    "dadosGoogle": {
      "googleId": "109876543210987654321",
      "email": "exemplo@gmail.com",
      "nome": "René Theo"
    }
  }
  ```
## Status
- 200: Login realizado com sucesso OU necessidade de criação de conta informada
- 400: Token ausente ou formato inválido
- 401: Token do Google inválido, expirado ou corrompido
- 403: E-mail da conta Google não verificado
- 409: Conta encontrada por e-mail, porém não vinculada ao Google
- 500: Erro interno no servidor
