Endpoint público para validar o código de recuperação e definir uma nova senha para a conta do motorista.
## Rota URL
- Rota: /motorista/recuperar-conta/recuperar
- Tipo: POST
- *Nota: Endpoint público, não exige cookies de autenticação.*
## Dados Esperados
- **Corpo (Body)**:
  - "email": String, Formato de E-mail, minimo de 3 e máximo de 150
  - "cod": String, exatamente 6 dígitos
  - "senha": String, máximo de 100 (nova senha a ser definida)
#### Exemplo
``` JSON
{
  "email": "renetheo@gmail.com",
  "cod": "123456",
  "senha": "novasenhamarota"
}
```
## Respostas
- "msg": mensagem com o sucesso ou erro da solicitação, exemplo: msg: "Senha Recuperada com Sucesso!"
- "erro": no caso da falha da validação dos dados enviados, será exibido esse objeto com os erros e em qual campo.
#### Exemplo (Erro de Validação)
``` JSON
{
    "msg": "Dados Inválidos para recuperação de senha.",
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
- 200: Senha alterada e recuperada com sucesso
- 400: Dados de entrada inválidos (Zod validation fail)
- 401: Código digitado inválido, incorreto ou expirado (limite de 5 minutos)
- 404: Nenhuma conta encontrada com o e-mail informado
- 500: Erro interno no servidor ao tentar redefinir a senha
