Endpoint autenticado para obter todos os dados de um aluno específico vinculado ao motorista logado.

## Rota URL

- Rota: `/aluno/:id`
- Tipo: `GET`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica o aluno.

#### Exemplo

```text
GET /aluno/8
```

## Respostas

- `resultado`: Objeto com todos os dados do aluno.

#### Exemplo de sucesso

```json
{
  "resultado": {
    "id": 8,
    "nome": "Ana Souza",
    "data_nasc": "2015-04-12",
    "ano_escolar": "5º",
    "observacao": "Buscar no portão lateral",
    "latitude": -23.55052,
    "longitude": -46.633308,
    "turno": "tarde",
    "responsavel_id": 3,
    "escola_id": 2,
    "motorista_id": 7
  }
}
```

Somente os dados de um aluno vinculado ao motorista autenticado são consultados.

#### Exemplo de aluno não encontrado

```json
{
  "msg": "Nenhuma Aluno Encontrada."
}
```

## Status

- `200`: Aluno encontrado e retornado com sucesso.
- `400`: `id` ausente, não numérico, igual a zero ou negativo.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Aluno ou motorista da sessão não encontrado; também pode indicar uma conta com exclusão agendada.
- `500`: Erro interno no servidor.
