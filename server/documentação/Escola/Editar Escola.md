Endpoint autenticado para editar os dados de uma escola vinculada ao motorista logado.

## Rota URL

- Rota: `/escola/editar`
- Tipo: `PATCH`
- Nota: rota protegida. É necessário enviar o cookie `token` de autenticação.

## Dados Esperados

### Cabeçalho (Cookie)

- `token`: String (JWT da sessão).

### Corpo (Body)

- `id`: Número inteiro positivo que identifica a escola (obrigatório).
- `nome`: String entre 1 e 200 caracteres (opcional).
- `endereco`: String entre 5 e 255 caracteres (opcional).
- `tel`: String com exatamente 11 dígitos (opcional).
- `hora_abertura`: String com um horário ISO válido (opcional).
- `hora_fechamento`: String com um horário ISO válido (opcional).
- `latitude`: Número entre -90 e 90 (opcional).
- `longitude`: Número entre -180 e 180 (opcional).

Além do `id`, é necessário enviar pelo menos um campo para edição. O campo `tel` deve ser enviado sem máscara.

#### Exemplo

```json
{
  "id": 1,
  "nome": "Colégio Caminhos do Saber",
  "hora_fechamento": "19:00:00"
}
```

## Respostas

- `msg`: Mensagem que descreve o resultado da solicitação.
- `erro`: Objeto com os erros de cada campo quando a validação falha.

#### Exemplo de sucesso

```json
{
  "msg": "Escola editada com sucesso!"
}
```

Somente uma escola vinculada ao motorista autenticado pode ser alterada. Quando o `id` não existe ou pertence a outro motorista, o endpoint responde com `404`.

#### Exemplo de escola não encontrada

```json
{
  "msg": "Nenhuma Escola Encontrada."
}
```

Na implementação atual, `latitude` ou `longitude` com valor `0` não são reconhecidas como campos enviados durante a edição. Se forem os únicos campos de alteração, a resposta será `400`.

## Status

- `200`: Escola editada com sucesso.
- `400`: `id` ausente, dados inválidos ou nenhum campo reconhecido para edição.
- `401`: Cookie de autenticação ausente ou inválido.
- `404`: Escola não encontrada para o motorista autenticado, motorista da sessão não encontrado ou com exclusão agendada.
- `500`: Erro interno no servidor.
