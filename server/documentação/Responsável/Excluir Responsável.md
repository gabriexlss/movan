Endpoint autenticado para excluir um responsável vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel/:id`
- Tipo: `DELETE`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica o responsável.

#### Exemplo

```text
DELETE /responsavel/1
```

## Respostas

- `msg`: mensagem que descreve o resultado da solicitação.
- `erro`: objeto com os erros de validação do `id`, quando ele for inválido.

#### Exemplo de sucesso

```json
{
  "msg": "Responsável excluído com sucesso."
}
```

Somente um responsável vinculado ao motorista autenticado pode ser excluído. Quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `404`.

#### Exemplo de responsável não encontrado

```json
{
  "msg": "Responsável não encontrado."
}
```

## Status

- `200`: Responsável excluído com sucesso.
- `400`: `id` ausente ou inválido.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `404`: Responsável não encontrado para o motorista autenticado.
- `409`: A integridade referencial do banco impediu a exclusão porque existem alunos vinculados ao responsável.
- `500`: Erro interno no servidor.
