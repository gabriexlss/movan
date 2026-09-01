Endpoint autenticado para listar, de forma resumida, as escolas vinculadas ao motorista logado.

## Rota URL

- Rota: `/escola`
- Tipo: `GET`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

Nenhum dado é esperado no corpo da requisição ou nos parâmetros.

## Respostas

- `escolas`: Array ordenado por `id`, contendo o `id` e o `nome` de cada escola vinculada ao motorista autenticado.

#### Exemplo de sucesso

```json
{
  "escolas": [
    {
      "id": 1,
      "nome": "Escola Caminhos do Saber"
    },
    {
      "id": 2,
      "nome": "Colégio Horizonte"
    }
  ]
}
```

Quando o motorista ainda não possui escolas, a consulta continua sendo bem-sucedida e retorna um array vazio.

#### Exemplo sem escolas cadastradas

```json
{
  "escolas": []
}
```

## Status

- `200`: Lista obtida com sucesso, inclusive quando estiver vazia.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `500`: Erro interno no servidor.
