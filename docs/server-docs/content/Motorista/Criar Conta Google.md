Endpoint público para criar uma nova conta de motorista vinculada ao Google ID.

## Rota URL

- Rota: /motorista/google/criar
- Tipo: POST
- _Nota: Endpoint público, não exige cookie de autenticação prévio._

## Dados Esperados

- **Corpo (Body)**:
  - "nome": String, máximo de 200 e mínimo de 3
  - "cnpj": String, 14 caracteres sem máscara
  - "senha": String, máximo de 100
  - "token": String, ID Token JWT fornecido pelo SDK do Google

#### Exemplo

```JSON
{
  "nome": "René Theo",
  "cnpj": "12345678901234",
  "senha": "03082007",
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

## Respostas

- "msg": mensagem informando o resultado da criação da conta.
- "erro": objeto contendo os detalhes caso a validação falhe.

#### Exemplo (Sucesso)

```JSON
{
  "msg": "Conta criada com sucesso."
}
```

## Status

- 201: Conta criada com sucesso via Google (conta nasce já verificada e define cookie `token`)
- 400: Dados inválidos para criação da conta
- 401: Token do Google inválido, expirado ou corrompido
- 403: E-mail da conta Google não verificado
- 409: E-mail ou CNPJ já cadastrado no Movan
- 500: Erro interno no servidor
