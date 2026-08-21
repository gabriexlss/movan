Endpoint autenticado para excluir um responsável vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel/excluir`
- Tipo: `DELETE`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Corpo (Body)

- `id`: Número positivo que identifica o responsável.

#### Exemplo

```json
{
  "id": 1
}
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

Somente um responsável vinculado ao motorista autenticado pode ser excluído. Atualmente, a resposta de sucesso também é retornada quando o `id` informado não pertence a esse motorista ou não existe.

## Status

- `200`: Solicitação de exclusão processada.
- `400`: `id` ausente ou inválido.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
