Endpoint autenticado para obter todos os dados de um responsável específico vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel/dados/:id`
- Tipo: `GET`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número positivo que identifica o responsável.

#### Exemplo

```text
GET /responsavel/dados/1
```

## Respostas

- `responsavel`: Objeto com todos os dados do responsável.

#### Exemplo de sucesso

```json
{
  "responsavel": {
    "id": 1,
    "cpf": "12345678901",
    "nome": "Maria da Silva",
    "endereco": "Rua das Flores, 123",
    "tel": "11987654321",
    "email": "maria@email.com",
    "motorista_id": 7
  }
}
```

Somente os dados de um responsável vinculado ao motorista autenticado são consultados. Atualmente, quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `200` e um objeto JSON vazio.

## Status

- `200`: Consulta processada.
- `400`: `id` ausente, não numérico, igual a zero ou negativo.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
