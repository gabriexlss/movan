Endpoint autenticado para listar, de forma resumida, os responsáveis vinculados ao motorista logado.

## Rota URL

- Rota: `/responsavel`
- Tipo: `GET`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

Nenhum dado é esperado no corpo da requisição ou nos parâmetros.

## Respostas

- `responsavel`: Array com `id` e `nome` de cada responsável vinculado ao motorista autenticado.

#### Exemplo de sucesso

```json
{
  "responsavel": [
    {
      "id": 1,
      "nome": "Maria da Silva"
    },
    {
      "id": 2,
      "nome": "João dos Santos"
    }
  ]
}
```

Quando o motorista ainda não possui responsáveis, o endpoint responde com `404`.

#### Exemplo sem responsáveis cadastrados

```json
{
  "msg": "Nenhum Respnsável Encontrado."
}
```

## Status

- `200`: Lista obtida com sucesso.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Nenhum responsável encontrado, motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
