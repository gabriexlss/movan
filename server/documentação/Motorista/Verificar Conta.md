Endpoint referente à verificação da conta do motorista por meio do código enviado ao e-mail.
## Rota URL
- Rota: /motorista/verificar
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
- "msg": mensagem com o sucesso ou erro da solicitação, exemplo: msg: "Conta Verificada com Sucesso."
- "erro": no caso da falha da validação dos dados enviados, será exibido esse objeto com os erros e em qual campo.
#### Exemplo (Erro de Validação)
``` JSON
{
    "msg": "Dados Invalidos para verificação da conta",
    "erro": {
        "_errors": [],
        "cod": {
            "_errors": [
                "O Código não é tem que ter exatamente 6 digitos"
            ]
        }
    }
}
```
## Status
- 200: Conta Verificada com Sucesso
- 400: Dados de requisição inválidos ou conta já verificada anteriormente
- 401: Código inválido/expirado ou token de autenticação ausente/inválido
- 500: Erro interno no servidor ao atualizar o banco de dados
