Endpoint autenticado para obter todos os dados de uma escola específica vinculada ao motorista logado.

## Rota URL

- Rota: `/escola/:id`
- Tipo: `GET`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica a escola.

#### Exemplo

```text
GET /escola/1
```

## Respostas

- `resultado`: Objeto com todos os dados da escola.

#### Exemplo de sucesso

```json
{
  "resultado": {
    "id": 1,
    "nome": "Escola Caminhos do Saber",
    "endereco": "Rua das Flores, 123",
    "tel": "11987654321",
    "latitude": -23.55052,
    "longitude": -46.633308,
    "motorista_id": 7
  }
}
```

Somente os dados de uma escola vinculada ao motorista autenticado são consultados. Quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `404`.

#### Exemplo de escola não encontrada

```json
{
  "msg": "Nenhuma Escola Encontrada."
}
```

## Status

- `200`: Escola encontrada e retornada com sucesso.
- `400`: `id` ausente, não numérico, igual a zero ou negativo.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Escola não encontrada para o motorista autenticado, motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
