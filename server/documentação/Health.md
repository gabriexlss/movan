Endpoint de teste para verificar se o servidor está online e funcionando corretamente.
## Rota URL
- Rota: /health
- Tipo: GET
## Dados Esperados
Nenhum dado é esperado no corpo da requisição ou nos parâmetros.
## Respostas
- "msg": mensagem contendo o status de funcionamento do servidor, exemplo: msg: "OK"
#### Exemplo
``` JSON
{
  "msg": "OK"
}
```
## Status
- 200: Servidor online e funcionando corretamente
- qualquer outro status: erro no servidor.
