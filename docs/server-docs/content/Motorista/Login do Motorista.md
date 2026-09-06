Endpoint para fazer login na conta do motorista.

## Rota URL

- Rota: /motorista/login
- Tipo: POST
- _Nota: Se a conta estiver agendada para exclusão (soft delete), o login bem-sucedido cancela o agendamento de exclusão automaticamente._

## Dados Esperados

- "login": String, mínimo de 3 e máximo de 255 caracteres (pode ser o e-mail ou o CNPJ do motorista)
- "senha": String, máximo de 100

#### Exemplo

```JSON
{
"login": "renetheo@gmail.com",
"senha": "030927897"
}
```

## Respostas

- "msg": mensagem que descreve o resultado da solicitação. Exemplo: "Login realizado com sucesso."
- "erro": objeto retornado quando a validação dos dados falha; indica os erros de cada campo.

#### Exemplo

```JSON
{
    "msg": "Dados inválidos para fazer login.",
    "erro": {
        "_errors": [],
        "login": {
            "_errors": [
                "Credenciais de Login muito curtas"
            ]
        }
    }
}
```

## Status

- 200: Login realizado com sucesso (cancela agendamento de exclusão se houver).
- 400: Dados ausentes ou inválidos.
- 401: E-mail, CNPJ ou senha inválidos.
- 500: Erro interno no servidor.
