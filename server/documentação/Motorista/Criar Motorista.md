Endpoint para criar uma conta de motorista.
## Rota URL
- Rota: /motorista
- Tipo: POST
## Dados Esperados
- "nome": String, máximo de 200 e minimo de 3
- "cnpj": String, 14 caracteres(sem máscara. apenas números) 
- "senha": String, máximo de 100
- "email": String, Formato de Email, minimo de 3 e máximo de 150
#### Exemplo
``` JSON
{
"nome": "rene",
"cnpj": "12345678901234",
"email": "renetheo@gmail.com",
"senha": "03082007"
}
```
## Respostas
- "msg": mensagem que descreve o resultado da solicitação. Exemplo: "Conta criada com sucesso."
- "erro": objeto retornado quando a validação dos dados falha; indica os erros de cada campo.
#### Exemplo
``` JSON
{
    "msg": "Dados inválidos para criar a conta.",
    "erro": {
        "_errors": [],
        "nome": {
            "_errors": [
                "Nome muito Curto"
            ]
        }
    }
}
```
## Status
- 201: Conta criada com sucesso.
- 400: Dados ausentes ou inválidos.
- 409: E-mail ou CNPJ já cadastrado.
- 500: Erro interno no servidor.
