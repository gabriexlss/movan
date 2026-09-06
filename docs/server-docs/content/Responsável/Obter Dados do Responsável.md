Endpoint autenticado para obter todos os dados de um responsável específico vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel/:id`
- Tipo: `GET`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica o responsável.

#### Exemplo

```text
GET /responsavel/1
```

## Respostas

- `responsavel`: Objeto com todos os dados do responsável.

#### Exemplo de sucesso

```json
{
  "responsavel": {
    "id": 1,
    "cpf": "52998224725",
    "nome": "Maria da Silva",
    "endereco": "Rua das Flores, 123",
    "tel": "11987654321",
    "email": "maria@email.com",
    "motorista_id": 7
  }
}
```

Somente os dados de um responsável vinculado ao motorista autenticado são consultados. Quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `404`.

#### Exemplo de responsável não encontrado

```json
{
  "msg": "Responsável não encontrado."
}
```

## Status

- `200`: Responsável encontrado e retornado com sucesso.
- `400`: `id` ausente, não numérico, igual a zero ou negativo.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `404`: Responsável não encontrado para o motorista autenticado.
- `500`: Erro interno no servidor.
