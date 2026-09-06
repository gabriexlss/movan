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

- `alunos`: Array ordenado por `id`, contendo o `id` e o `nome` de cada aluno vinculado ao motorista autenticado.

#### Exemplo de sucesso

```json
{
  "alunos": [
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

Quando o motorista ainda não possui alunos, a consulta continua sendo bem-sucedida e retorna um array vazio.

#### Exemplo sem alunos cadastrados

```json
{
  "alunos": []
}
```

## Status

- `200`: Lista obtida com sucesso, inclusive quando estiver vazia.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `500`: Erro interno no servidor.
