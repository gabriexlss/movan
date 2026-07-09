Endpoint referente a criação do motorista, ou, usuário. 
## Rota URL
- Rota: /motorista/criar
- Tipo: POST
## Dados Esperados
- "nome": String, máximo de 50 e minimo de 3
- "cnpj": String, 14 caracteres(sem máscara. apenas números) 
- "senha": String
- "email": String, Formato de Email, minimo de 3 e máximo de 255
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
- "msg":  mensagem com o sucesso ou erro da solicitação, exemplo: msg: "Motorista criado com sucesso!"
- "erro": no caso da falha da validação dos dados enviados, será exibido esse objeto com os erros e em qual campo.
#### Exemplo
``` JSON
{
    "msg": "Dados Invalidos para criação do motorista",
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
- 201: Motorista Criado com sucesso
- 400: Dados Faltando ou enviados de forma incorreta
- 500: Erro na hora de salvar no banco de dados