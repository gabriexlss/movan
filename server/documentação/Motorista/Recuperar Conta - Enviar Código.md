Endpoint público para solicitar o envio do código de recuperação de senha por e-mail.
## Rota URL
- Rota: /motorista/recuperar-conta/enviar-codigo
- Tipo: POST
- *Nota: Endpoint público, não exige cookies de autenticação.*
## Dados Esperados
- **Corpo (Body)**:
  - "email": String, Formato de E-mail, minimo de 3 e máximo de 150
#### Exemplo
``` JSON
{
  "email": "renetheo@gmail.com"
}
```
## Respostas
- "msg": mensagem com o sucesso ou erro da solicitação, exemplo: msg: "Código de recuperação enviado com sucesso."
- "erro": no caso da falha da validação dos dados enviados, será exibido esse objeto com os erros e em qual campo.
#### Exemplo (Erro de Validação)
``` JSON
{
    "msg": "Dados Inválidos para recuperação de senha.",
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
- 200: Código de recuperação enviado com sucesso para o e-mail informado
- 400: Dados inválidos ou e-mail formatado incorretamente
- 404: Nenhuma conta de motorista cadastrada com o e-mail informado
- 500: Erro interno do servidor ao gerar ou enviar o código
