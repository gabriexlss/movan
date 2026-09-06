Endpoint público para solicitar o envio do código de recuperação de senha por e-mail.

## Rota URL

- Rota: /motorista/recuperar-conta/enviar-codigo
- Tipo: POST
- _Nota: Endpoint público, não exige cookies de autenticação._

## Dados Esperados

- **Corpo (Body)**:
  - "email": String, formato de e-mail, mínimo de 3 e máximo de 150 caracteres

#### Exemplo

```JSON
{
  "email": "renetheo@gmail.com"
}
```

## Respostas

- "msg": mensagem que descreve o resultado da solicitação. Exemplo: "Código de recuperação enviado com sucesso."
- "erro": objeto retornado quando a validação dos dados falha; indica os erros de cada campo.

#### Exemplo (Erro de Validação)

```JSON
{
    "msg": "Dados inválidos para recuperação de senha.",
    "erro": {
        "_errors": [],
        "email": {
            "_errors": [
                "E-mail inválido"
            ]
        }
    }
}
```

## Status

- 200: Código de recuperação enviado com sucesso.
- 400: Dados inválidos ou e-mail em formato incorreto.
- 404: Nenhuma conta encontrada com o e-mail informado.
- 500: Erro interno no servidor.
