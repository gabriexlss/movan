Endpoint autenticado para editar os dados de um responsável vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel/:id`
- Tipo: `PATCH`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Parâmetro de rota

- `id`: Número inteiro positivo que identifica o responsável.

### Corpo (Body)

- `nome`: String entre 5 e 200 caracteres (opcional).
- `endereco`: String entre 10 e 255 caracteres (opcional).
- `tel`: String com exatamente 11 dígitos (opcional).
- `email`: E-mail válido entre 5 e 150 caracteres (opcional).

É necessário enviar pelo menos um campo para edição. O CPF não pode ser alterado por este endpoint.

#### Exemplo de rota

```text
PATCH /responsavel/1
```

#### Exemplo de corpo

```json
{
  "nome": "Maria Oliveira da Silva"
}
```

## Respostas

- `msg`: mensagem que descreve o resultado da solicitação.
- `erro`: objeto com os erros de cada campo quando a validação falha.

#### Exemplo de sucesso

```json
{
  "msg": "Responsável editado com sucesso."
}
```

Somente um responsável vinculado ao motorista autenticado pode ser alterado. Quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `404`.

#### Exemplo de responsável não encontrado

```json
{
  "msg": "Responsável não encontrado."
}
```

## Status

- `200`: Responsável editado com sucesso.
- `400`: `id` ausente, dados inválidos ou nenhum campo informado para edição.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `404`: Responsável não encontrado para o motorista autenticado.
- `413`: Corpo da requisição excede o limite aceito pela API.
- `500`: Erro interno no servidor.
