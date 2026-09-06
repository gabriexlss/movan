Endpoint autenticado para enviar o código de verificação ao novo e-mail antes de alterá-lo.

## Rota URL

- Rota: /motorista/editar/enviar-codigo
- Tipo: POST
- _Nota: Rota protegida. Necessário o cookie `token` de autenticação._

## Dados Esperados

- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
- **Corpo (Body)**:
  - "email": String, Formato de E-mail, minimo de 3 e máximo de 150 (novo e-mail desejado)

#### Exemplo

```JSON
{
  "email": "novoemail@exemplo.com"
}
```

## Respostas

- "msg": mensagem com o sucesso ou erro da solicitação, exemplo: msg: "Código para alteração de e-mail enviado com sucesso."
- "erro": no caso da falha da validação dos dados enviados.

#### Exemplo (Erro de Validação)

```JSON
{
    "msg": "Dados inválidos para alterar o e-mail.",
    "erro": {
        "_errors": [],
        "email": {
            "_errors": [
                "Email Invalido"
            ]
        }
    }
}
```

## Status

- 200: Código para alteração de e-mail enviado com sucesso
- 400: Dados inválidos para alteração de e-mail
- 401: Acesso negado por token ausente ou inválido
- 403: Conta não verificada
- 409: E-mail já cadastrado no Movan
- 500: Erro interno no servidor ao enviar o código
