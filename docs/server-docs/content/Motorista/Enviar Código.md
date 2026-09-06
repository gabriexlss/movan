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
- "msg": mensagem que descreve o resultado da solicitação. Exemplo: "Código para criação da conta enviado com sucesso."
#### Exemplo (Erro de Parâmetro Inválido)
``` JSON
{
    "msg": "Tipo de código inválido."
}
```
## Status
- 200: Código enviado com sucesso para o e-mail cadastrado.
- 400: Parâmetro `:tipo` ausente ou inválido.
- 401: Acesso negado por token ausente ou inválido.
- 500: Erro interno no servidor.
