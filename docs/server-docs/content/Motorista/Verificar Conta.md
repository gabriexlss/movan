Endpoint referente à verificação da conta do motorista por meio do código enviado ao e-mail.
## Rota URL
- Rota: /motorista/verificar-conta
- Tipo: POST
- *Nota: Rota protegida. Necessário o cookie `token` de autenticação.*
## Dados Esperados
- **Corpo (Body)**:
  - "cod": String, exatamente 6 dígitos
- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
#### Exemplo
``` JSON
{
  "cod": "123456"
}
```
## Respostas
- "msg": mensagem que descreve o resultado da solicitação. Exemplo: "Conta verificada com sucesso."
- "erro": objeto retornado quando a validação dos dados falha; indica os erros de cada campo.
#### Exemplo (Erro de Validação)
``` JSON
{
    "msg": "Dados inválidos para verificar a conta.",
    "erro": {
        "_errors": [],
        "cod": {
            "_errors": [
                "O Código tem que ter exatamente 6 digitos"
            ]
        }
    }
}
```
## Status
- 200: Conta verificada com sucesso.
- 400: Dados da requisição ou código inválidos.
- 401: Token de autenticação ausente ou inválido.
- 409: Conta já verificada.
- 500: Erro interno no servidor.
