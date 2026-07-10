Endpoint referente ao login do motorista, ou, usuário. 
## Rota URL
- Rota: /motorista/login
- Tipo: POST
## Dados Esperados
- "login": String, minimo de 3 e máximo de 255 (pode ser o E-mail ou o CNPJ do motorista)
- "senha": String
#### Exemplo
``` JSON
{
"login": "renetheo@gmail.com",
"senha": "030927897"
}
```
## Respostas
- "msg": mensagem com o sucesso ou erro da solicitação, exemplo: msg: "Login Realizado com Sucesso."
- "erro": no caso da falha da validação dos dados enviados, será exibido esse objeto com os erros e em qual campo.
#### Exemplo
``` JSON
{
    "msg": "Dados Invalidos para login do motorista",
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
- 200: Login Realizado com Sucesso
- 400: Dados Faltando, enviados de forma incorreta ou Senha Invalida
- 404: Nenhum Usuario Encontrado com o Email ou CNPJ Fornecidos
- 500: Erro interno do servidor, se der esse status me manda mensagem
