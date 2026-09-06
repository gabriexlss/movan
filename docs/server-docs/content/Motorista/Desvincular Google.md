Endpoint autenticado para desvincular a conta do Google da conta do motorista logado.

## Rota URL

- Rota: /motorista/google/desvincular
- Tipo: DELETE
- _Nota: Rota protegida. Necessário o cookie `token` de autenticação._

## Dados Esperados

- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
    Nenhum dado é esperado no corpo da requisição.

## Respostas

- "msg": mensagem de confirmação da desvinculação, exemplo: msg: "Conta Google Desvinculada com Sucesso."

#### Exemplo

```JSON
{
  "msg": "Conta Google Desvinculada com Sucesso."
}
```

## Status

- 200: Conta Google desvinculada com sucesso
- 401: Acesso negado por token ausente ou inválido
- 500: Erro interno no servidor
