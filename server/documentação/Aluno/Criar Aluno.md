Endpoint autenticado para cadastrar um aluno vinculado ao motorista logado.

## Rota URL

- Rota: `/aluno`
- Tipo: `POST`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Corpo (Body)

- `nome`: String entre 3 e 200 caracteres.
- `data_nasc`: Data no formato `YYYY-MM-DD`.
- `ano_escolar`: String entre 1 e 5 caracteres.
- `observacao`: String com até 255 caracteres (opcional).
- `latitude`: Número entre -90 e 90.
- `longitude`: Número entre -180 e 180.
- `turno`: String entre 1 e 5 caracteres.
- `responsavel_id`: Número inteiro positivo que identifica um responsável do motorista autenticado.
- `escola_id`: Número inteiro positivo que identifica uma escola do motorista autenticado.

Todos os campos são obrigatórios, exceto `observacao`.

#### Exemplo

```json
{
  "nome": "Ana Souza",
  "data_nasc": "2015-04-12",
  "ano_escolar": "5º",
  "observacao": "Buscar no portão lateral",
  "latitude": -23.55052,
  "longitude": -46.633308,
  "turno": "tarde",
  "responsavel_id": 3,
  "escola_id": 2
}
```

## Respostas

- `msg`: Mensagem que descreve o resultado da solicitação.
- `aluno`: Objeto com os dados gravados no banco, incluindo o `id` criado e o `motorista_id` obtido da sessão.
- `erro`: Objeto com os erros de cada campo quando a validação falha.

#### Exemplo de sucesso

```json
{
  "msg": "Aluno criado com sucesso!",
  "aluno": {
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

O responsável e a escola informados devem existir e pertencer ao motorista autenticado.

## Status

- `201`: Aluno criado com sucesso.
- `400`: Dados ausentes ou inválidos.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Responsável, escola ou motorista da sessão não encontrado; também pode indicar uma conta com exclusão agendada.
- `500`: Erro interno no servidor.
