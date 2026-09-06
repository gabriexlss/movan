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

- `responsaveis`: Array ordenado por `id`, contendo o `id` e o `nome` de cada responsável vinculado ao motorista autenticado.

#### Exemplo de sucesso

```json
{
  "responsaveis": [
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

Quando o motorista ainda não possui responsáveis, a consulta continua sendo bem-sucedida e retorna um array vazio.

#### Exemplo sem responsáveis cadastrados

```json
{
  "responsaveis": []
}
```

## Status

- `200`: Lista obtida com sucesso, inclusive quando estiver vazia.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `500`: Erro interno no servidor.
