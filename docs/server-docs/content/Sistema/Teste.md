Endpoint de teste para verificar se a credencial de acesso às rotas de sistema é válida.

## Rota URL

- Rota: /system/teste
- Tipo: GET

## Headers Esperados

- `credencial`: String, deve ser igual ao valor configurado em `SEGREDO_SISTEMA` no servidor.

## Respostas

```json
{
  "msg": "deu certo"
}
```

## Status

- 200: Credencial válida.
- 401: Credencial ausente, inválida ou diferente da credencial do sistema.
- 500: Variável `SEGREDO_SISTEMA` não configurada no servidor.
