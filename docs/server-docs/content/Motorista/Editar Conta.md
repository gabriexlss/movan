Endpoint autenticado para editar os dados do perfil do motorista (nome, CNPJ, senha e/ou e-mail).

## Rota URL

- Rota: /motorista
- Tipo: PATCH
- _Nota: Rota protegida. Necessário o cookie `token` de autenticação._

## Dados Esperados

- **Cabeçalho (Cookie)**:
  - `token`: String (JWT da sessão)
- **Corpo (Body)** (Todos os campos são opcionais, mas ao menos um deve ser informado):
  - "nome": String, minimo de 3 e máximo de 200 (opcional)
  - "cnpj": String, 14 caracteres sem máscara (opcional)
  - "senha": String, máximo de 100 (opcional)
  - "email": String, formato de e-mail, minimo de 3 e máximo de 150 (opcional)
  - "cod": String, exatamente 6 dígitos (obrigatório se "email" for informado)

#### Exemplo (Editando Nome e CNPJ)

```JSON
{
  "nome": "René Theo Editado",
  "cnpj": "98765432109876"
}
```

#### Exemplo (Editando E-mail)

```JSON
{
  "email": "novoemail@gmail.com",
  "cod": "123456"
}
```

## Respostas

- "msg": mensagem de sucesso ou erro da solicitação.
- "erro": objeto contendo os detalhes caso a validação falhe.

#### Exemplo (Sucesso)

```JSON
{
  "msg": "2 campos editados com sucesso."
}
```

## Status

- 200: Dados alterados com sucesso
- 400: Nao informou nenhum campo para editar, dados inválidos ou código ausente/inválido ao alterar e-mail
- 401: Acesso negado por token ausente ou inválido
- 403: Conta não verificada
- 409: E-mail ou CNPJ já cadastrado no Movan
- 500: Erro interno no servidor
