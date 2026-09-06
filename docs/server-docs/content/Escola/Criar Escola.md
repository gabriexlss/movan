Endpoint autenticado para cadastrar uma escola vinculada ao motorista logado.

## Rota URL

- Rota: `/escola`
- Tipo: `POST`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Corpo (Body)

- `nome`: String entre 1 e 200 caracteres.
- `endereco`: String entre 5 e 255 caracteres.
- `tel`: String com exatamente 11 dígitos.
- `latitude`: Número entre -90 e 90.
- `longitude`: Número entre -180 e 180.

O campo `tel` deve ser enviado sem máscara. Todos os campos são obrigatórios.

#### Exemplo

```json
{
  "nome": "Escola Caminhos do Saber",
  "endereco": "Rua das Flores, 123",
  "tel": "11987654321",
  "latitude": -23.55052,
  "longitude": -46.633308
}
```

## Respostas

- `msg`: Mensagem que descreve o resultado da solicitação.
- `escola`: Objeto com os dados gravados no banco, incluindo o `id` criado e o `motorista_id` obtido da sessão.
- `erro`: Objeto com os erros de cada campo quando a validação falha.

#### Exemplo de sucesso

```json
{
  "msg": "Escola criada com sucesso.",
  "escola": {
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

## Status

- `201`: Escola criada com sucesso.
- `400`: Dados ausentes ou inválidos.
- `401`: Sessão ausente ou inválida, inclusive quando o motorista da sessão não existe mais ou está com exclusão agendada.
- `413`: Corpo da requisição excede o limite aceito pela API.
- `500`: Erro interno no servidor.
