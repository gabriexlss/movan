Endpoint autenticado para obter as informações e dados do perfil do motorista logado.

## Rota URL

- Rota: /motorista
- Tipo: GET
- _Nota: Rota protegida. Necessário o cookie `token` de autenticação._

## Dados Esperados

- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
    Nenhum dado é esperado no corpo da requisição.

## Respostas

- "msg": mensagem informando o sucesso da solicitação.
- "motorista": objeto contendo as informações da conta do motorista (`id`, `nome`, `email`, `cnpj`, `data_exclusao`, `verificado`).

#### Exemplo

```JSON
{
  "msg": "Dados da conta obtidos com sucesso.",
  "motorista": {
    "id": 1,
    "nome": "René Theo",
    "email": "renetheo@gmail.com",
    "cnpj": "12345678901234",
    "data_exclusao": null,
    "verificado": true
  }
}
```

## Status

- 200: Dados da conta obtidos com sucesso
- 401: Acesso negado por token ausente ou inválido
- 403: Conta não verificada
- 500: Erro interno no servidor
