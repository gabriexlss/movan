Endpoint para deslogar a conta do motorista, destruindo o cookie de sessão `token`.
## Rota URL
- Rota: /motorista/logout
- Tipo: DELETE
- *Nota: Endpoint público/híbrido. Limpa o cookie `token` caso exista.*
## Dados Esperados
Nenhum dado é esperado no corpo da requisição ou nos parâmetros.
## Respostas
- "msg": mensagem de confirmação do logout, exemplo: msg: "Logout realizado com sucesso."
#### Exemplo
``` JSON
{
  "msg": "Logout realizado com sucesso."
}
```
## Status
- 200: Logout realizado com sucesso e cookie `token` removido
