Endpoint autenticado para editar os dados de um aluno vinculado ao motorista logado.

## Rota URL

- Rota: `/aluno/:id`
- Tipo: `PATCH`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica o aluno.

### Corpo (Body)

- `nome`: String entre 3 e 200 caracteres (opcional).
- `data_nasc`: Data no formato `YYYY-MM-DD` (opcional).
- `ano_escolar`: String entre 1 e 5 caracteres (opcional).
- `observacao`: String com até 255 caracteres (opcional). Envie uma string vazia para limpar o campo.
- `latitude`: Número entre -90 e 90 (opcional).
- `longitude`: Número entre -180 e 180 (opcional).
- `turno`: String entre 1 e 5 caracteres (opcional).
- `escola_id`: Número inteiro positivo que identifica uma escola do motorista autenticado (opcional).

É necessário enviar pelo menos um campo reconhecido para edição. O `responsavel_id` não pode ser alterado por este endpoint.

#### Exemplo de rota

```text
PATCH /aluno/8
```

#### Exemplo de corpo

```json
{
  "escola_id": 4,
  "turno": "manhã"
}
```

## Respostas

- `msg`: Mensagem que descreve o resultado da solicitação.
- `erro`: Objeto com os erros de validação, quando os dados forem inválidos.

#### Exemplo de sucesso

```json
{
  "msg": "Aluno editado com sucesso."
}
```

Somente um aluno vinculado ao motorista autenticado pode ser alterado. Quando `escola_id` é enviado, a escola também deve pertencer a esse motorista.

#### Exemplo de aluno não encontrado

```json
{
  "msg": "Aluno não encontrado."
}
```

## Status

- `200`: Aluno editado com sucesso.
- `400`: `id` ausente ou inválido, dados inválidos ou nenhum campo reconhecido para edição.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `404`: Aluno ou escola informada não encontrado para o motorista autenticado.
- `409`: A escola informada deixou de estar disponível durante a edição.
- `413`: Corpo da requisição excede o limite aceito pela API.
- `500`: Erro interno no servidor.
