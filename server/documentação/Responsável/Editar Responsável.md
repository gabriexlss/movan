Endpoint autenticado para editar os dados de um responsável vinculado ao motorista logado.

## Rota URL

- Rota: `/responsavel/editar`
- Tipo: `PATCH`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Corpo (Body)

- `id`: Número positivo que identifica o responsável (obrigatório).
- `cpf`: String com exatamente 11 dígitos e um CPF válido (opcional).
- `nome`: String entre 5 e 200 caracteres (opcional).
- `endereco`: String entre 10 e 255 caracteres (opcional).
- `tel`: String com exatamente 11 dígitos (opcional).
- `email`: E-mail válido entre 5 e 150 caracteres (opcional).

Além do `id`, é necessário enviar pelo menos um campo para edição.

#### Exemplo

```json
{
  "id": 1,
  "nome": "Maria Oliveira da Silva"
}
```

## Respostas

- `msg`: mensagem que descreve o resultado da solicitação.
- `erro`: objeto com os erros de cada campo quando a validação falha.

#### Exemplo de sucesso

```json
{
  "msg": "Responsavel Editado com Sucesso."
}
```

Somente um responsável vinculado ao motorista autenticado pode ser alterado. Atualmente, a resposta de sucesso também é retornada quando o `id` informado não pertence a esse motorista ou não existe.

## Status

- `200`: Solicitação de edição processada.
- `400`: `id` ausente, dados inválidos ou nenhum campo informado para edição.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
