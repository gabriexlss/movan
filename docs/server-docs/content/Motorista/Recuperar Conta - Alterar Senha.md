Endpoint público para validar o código de recuperação e definir uma nova senha para a conta do motorista.

## Rota URL

- Rota: /motorista/recuperar-conta/recuperar
- Tipo: POST
- _Nota: Endpoint público, não exige cookies de autenticação._

## Dados Esperados

- **Corpo (Body)**:
  - "email": String, formato de e-mail, mínimo de 3 e máximo de 150 caracteres
  - "cod": String, exatamente 6 dígitos
  - "senha": String, máximo de 100 (nova senha a ser definida)

#### Exemplo

```JSON
{
  "email": "renetheo@gmail.com",
  "cod": "123456",
  "senha": "novasenhamarota"
}
```

## Respostas

- "msg": mensagem que descreve o resultado da solicitação. Exemplo: "Senha alterada com sucesso."
- "erro": objeto retornado quando a validação dos dados falha; indica os erros de cada campo.

#### Exemplo (Erro de Validação)

```JSON
{
    "msg": "Dados inválidos para recuperação de senha.",
    "erro": {
        "_errors": [],
        "senha": {
            "_errors": [
                "Senha muito Longa"
            ]
        }
    }
}
```

## Status

- 200: Senha alterada com sucesso.
- 400: Dados da requisição ou código inválidos; o código expira em cinco minutos.
- 404: Nenhuma conta encontrada com o e-mail informado.
- 500: Erro interno no servidor.
