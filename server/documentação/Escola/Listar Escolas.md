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

- `resultado`: Array com `id` e `nome` de cada escola vinculada ao motorista autenticado.

#### Exemplo de sucesso

```json
{
  "resultado": [
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

Quando o motorista ainda não possui escolas, o endpoint responde com `404`.

#### Exemplo sem escolas cadastradas

```json
{
  "msg": "Nenhuma Escola Encontrada."
}
```

## Status

- `200`: Lista obtida com sucesso.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Nenhuma escola encontrada, motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
