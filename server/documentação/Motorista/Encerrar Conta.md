Endpoint autenticado para agendar o encerramento (soft delete) da conta do motorista após 30 dias.
## Rota URL
- Rota: /motorista/encerrar-conta
- Tipo: DELETE
- *Nota: Rota protegida. Necessário o cookie `token` de autenticação.*
## Dados Esperados
- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
- **Corpo (Body)**:
  - "senha": String (senha atual do motorista para confirmação)
#### Exemplo
``` JSON
{
  "senha": "03082007"
}
```
## Respostas
- "msg": mensagem confirmando o agendamento da exclusão da conta.
- "erro": detalhes de validação caso os dados estejam incorretos.
#### Exemplo (Sucesso)
``` JSON
{
  "msg": "Conta agendada para exclusão com sucesso."
}
```
## Status
- 200: Conta agendada para exclusão com sucesso e cookie de sessão limpo
- 400: Senha ausente ou inválida para confirmação de exclusão
- 401: Senha incorreta ou token de autenticação ausente/inválido
- 500: Erro interno no servidor
