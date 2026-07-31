Endpoint público para criar uma nova conta de motorista vinculada ao Google ID.
## Rota URL
- Rota: /motorista/google/criar
- Tipo: POST
- *Nota: Endpoint público, não exige cookie de autenticação prévio.*
## Dados Esperados
- **Corpo (Body)**:
  - "nome": String, máximo de 200 e mínimo de 3
  - "cnpj": String, 14 caracteres sem máscara
  - "email": String, formato de e-mail, máximo de 150
  - "senha": String, máximo de 100
  - "googleId": String, ID fornecido no payload do Google
#### Exemplo
``` JSON
{
  "nome": "René Theo",
  "cnpj": "12345678901234",
  "email": "renetheo@gmail.com",
  "senha": "03082007",
  "googleId": "109876543210987654321"
}
```
## Respostas
- "msg": mensagem informando o resultado da criação da conta.
- "erro": objeto contendo os detalhes caso a validação falhe.
#### Exemplo (Sucesso)
``` JSON
{
  "msg": "Conta criada com sucesso."
}
```
## Status
- 201: Conta criada com sucesso via Google (define cookie `token` e envia código de verificação)
- 400: Dados inválidos para criação da conta
- 409: E-mail ou CNPJ já cadastrado no Movan
- 500: Erro interno no servidor
