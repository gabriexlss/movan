Endpoint administrativo para excluir definitivamente as contas cuja exclusão foi agendada há mais de 30 dias.

## Rota URL

- Rota: /system/limpeza-usuarios
- Tipo: DELETE

## Headers Esperados

- `credencial`: String, deve ser igual ao valor configurado em `SEGREDO_SISTEMA` no servidor.

## Dados Esperados

Nenhum dado é esperado no corpo da requisição ou nos parâmetros.

## Respostas

```json
{
  "msg": "Limpeza concluida! 3 usúarios deletados"
}
```

O número na mensagem corresponde à quantidade de contas excluídas pela rotina.

## Status

- 200: Limpeza concluída.
- 401: Credencial ausente, inválida ou diferente da credencial do sistema.
- 500: Erro ao realizar a limpeza ou variável `SEGREDO_SISTEMA` não configurada no servidor.
