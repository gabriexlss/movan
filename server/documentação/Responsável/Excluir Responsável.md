Endpoint autenticado para excluir um responsável vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel/excluir/:id`
- Tipo: `DELETE`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número positivo que identifica o responsável.

#### Exemplo

```text
DELETE /responsavel/excluir/1
```

## Respostas

- `msg`: mensagem que descreve o resultado da solicitação.
- `erro`: objeto com os erros de validação do `id`, quando ele for inválido.

#### Exemplo de sucesso

```json
{
  "msg": "Responsável deletado com sucesso."
}
```

Somente um responsável vinculado ao motorista autenticado pode ser excluído. Quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `404`.

#### Exemplo de responsável não encontrado

```json
{
  "msg": "Nenhum Responsável encontrado."
}
```

## Status

- `200`: Responsável excluído com sucesso.
- `400`: `id` ausente ou inválido.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Responsável não encontrado para o motorista autenticado, motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
