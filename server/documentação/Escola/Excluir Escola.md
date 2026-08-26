Endpoint autenticado para excluir uma escola vinculada ao motorista logado.

## Rota URL

- Rota: `/escola/excluir/:id`
- Tipo: `DELETE`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica a escola.

#### Exemplo

```text
DELETE /escola/excluir/1
```

## Respostas

- `msg`: Mensagem que descreve o resultado da solicitação.
- `erro`: Objeto com os erros de validação do `id`, quando ele for inválido.

#### Exemplo de sucesso

```json
{
  "msg": "Escola Excluida com sucesso."
}
```

Somente uma escola vinculada ao motorista autenticado pode ser excluída. Quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `404`.

#### Exemplo de escola não encontrada

```json
{
  "msg": "Nenhum Escola Encontrada."
}
```

## Status

- `200`: Escola excluída com sucesso.
- `400`: `id` ausente, não numérico, igual a zero ou negativo.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Escola não encontrada para o motorista autenticado, motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
