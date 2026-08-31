Endpoint autenticado para excluir um aluno vinculado ao motorista logado.

## Rota URL

- Rota: `/aluno/:id`
- Tipo: `DELETE`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica o aluno.

#### Exemplo

```text
DELETE /aluno/8
```

## Respostas

- `msg`: Mensagem que descreve o resultado da solicitação.
- `erro`: Objeto com os erros de validação do `id`, quando ele for inválido.

#### Exemplo de sucesso

```json
{
  "msg": "Aluno Excluido com sucesso."
}
```

Somente um aluno vinculado ao motorista autenticado pode ser excluído.

#### Exemplo de aluno não encontrado

```json
{
  "msg": "Nenhum aluno Encontrado."
}
```

## Status

- `200`: Aluno excluído com sucesso.
- `400`: `id` ausente, não numérico, igual a zero ou negativo.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Aluno ou motorista da sessão não encontrado; também pode indicar uma conta com exclusão agendada.
- `500`: Erro interno no servidor.
