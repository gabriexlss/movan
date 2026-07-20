Endpoint referente ao envio (ou reenvio) de código de verificação para o e-mail do motorista.
## Rota URL
- Rota: /motorista/codigo/:tipo
- Tipo: POST
- *Nota: Rota protegida. Necessário o cookie `token` de autenticação.*
## Dados Esperados
- **Parâmetro de Rota (URL)**:
  - `:tipo`: String, deve ser `criação` ou `recuperação` (atualmente o servidor processa internamente como `criação`).
- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
#### Exemplo
Requisição POST para `/motorista/codigo/criação` com o cookie `token` devidamente configurado.
## Respostas
- "msg": mensagem com o sucesso ou erro da solicitação, exemplo: msg: "Código para criação da conta enviado com sucesso."
- "erro": descrição do erro no caso de parâmetros enviados incorretamente na rota.
#### Exemplo (Erro de Parâmetro Inválido)
``` JSON
{
    "msg": "Erro Interno do Servidor",
    "erro": "Tipo não corresponde nem a criação nem a recuperação de conta"
}
```
## Status
- 200: Código enviado com sucesso para o e-mail cadastrado
- 400: Parâmetro `:tipo` inválido na rota
- 401: Acesso negado por token ausente ou inválido
- 500: Erro ao enviar o código ou ao consultar o banco de dados
