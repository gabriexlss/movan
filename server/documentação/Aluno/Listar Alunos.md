Endpoint autenticado para listar, de forma resumida, os alunos vinculados ao motorista logado.

## Rota URL

- Rota: `/aluno`
- Tipo: `GET`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

Nenhum dado é esperado no corpo da requisição ou nos parâmetros.

## Respostas

- `resultado`: Array ordenado por `id`, contendo o `id` e o `nome` de cada aluno vinculado ao motorista autenticado.

#### Exemplo de sucesso

```json
{
  "resultado": [
    {
      "id": 8,
      "nome": "Ana Souza"
    },
    {
      "id": 9,
      "nome": "Bruno Lima"
    }
  ]
}
```

Quando o motorista ainda não possui alunos, o endpoint responde com `404`.

#### Exemplo sem alunos cadastrados

```json
{
  "msg": "Nenhuma Aluno Encontrada."
}
```

## Status

- `200`: Lista obtida com sucesso.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Nenhum aluno ou motorista da sessão encontrado; também pode indicar uma conta com exclusão agendada.
- `500`: Erro interno no servidor.
