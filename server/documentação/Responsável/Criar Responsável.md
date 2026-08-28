Endpoint autenticado para cadastrar um responsável vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel`
- Tipo: `POST`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Corpo (Body)

- `cpf`: String com exatamente 11 dígitos e um CPF válido.
- `nome`: String entre 5 e 200 caracteres.
- `endereco`: String entre 10 e 255 caracteres.
- `tel`: String com exatamente 11 dígitos.
- `email`: E-mail válido entre 5 e 150 caracteres.

Os campos `cpf` e `tel` devem ser enviados sem máscara.

#### Exemplo

```json
{
  "cpf": "12345678901",
  "nome": "Maria da Silva",
  "endereco": "Rua das Flores, 123",
  "tel": "11987654321",
  "email": "maria@email.com"
}
```

## Respostas

- `msg`: mensagem que descreve o resultado da solicitação.
- `responsavel`: objeto com os dados gravados no banco, incluindo o `id` criado e o `motorista_id` obtido da sessão.
- `erro`: objeto com os erros de cada campo quando a validação falha.

#### Exemplo de sucesso

```json
{
  "msg": "Responsavel criado com sucesso.",
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

## Status

- `201`: Responsável criado com sucesso.
- `400`: Dados ausentes ou inválidos.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
