# Servidor Movan

A referência completa dos endpoints fica no repositório [movandocs](https://github.com/gabriexlss/movandocs), em `content/`. Para a branch `contratos`, consulte os módulos de clientes, contratos, cláusulas e assinaturas; essas rotas ainda não estão montadas na `main@802e94c`.

## Contratos e arquivos

A branch `contratos@19c32ed` implementa rascunhos, cláusulas, geração de PDF, assinatura reutilizável do motorista, assinatura do responsável por token de uso único válido por 15 dias, recriação de link e cancelamento. Os uploads usam o campo `assinatura` em `multipart/form-data`, MIME `image/webp` e limite de 1 MiB.

Configure todas as variáveis de R2 e `CDN_URL` de `.env.example`, além do PostgreSQL. O schema do banco deve conter as tabelas do módulo e as views `vw_resumo_contrato` e `vw_detalhes_contrato`; suas definições não estão versionadas.

## Limpeza diária de contas na Vercel

O arquivo `vercel.json` agenda `GET /system/limpeza-usuarios` diariamente às
06h UTC, equivalente às 03h em São Paulo. A rota reutiliza a rotina de limpeza
existente, que apaga definitivamente contas marcadas para exclusão há pelo menos
30 dias. Na branch `contratos`, a rotina remove primeiro os arquivos do usuário
no R2 sob `motoristas/<id>/` e depois sua conta no banco. Se uma exclusão falhar,
a resposta informa os contadores parciais de usuários e arquivos excluídos. No plano Hobby, a execução pode ocorrer entre 03h e 03h59.

Para ativar:

1. No projeto do **backend** na Vercel, use `server` como **Root Directory**.
2. Cadastre `CRON_SECRET` nas variáveis de ambiente de **Production**, com um
   segredo aleatório de pelo menos 16 caracteres.
3. Faça um novo deploy de produção para registrar o cron e disponibilizar a variável.
4. Consulte **Settings → Cron Jobs** e os logs para acompanhar as execuções.

A Vercel envia o segredo automaticamente no header
`Authorization: Bearer <CRON_SECRET>`. Chamadas sem a credencial correta são
rejeitadas antes de consultar o banco. O agendamento funciona em produção;
ambientes locais e previews não executam essa rotina automaticamente.

A rota administrativa `DELETE /system/limpeza-usuarios` continua usando
o header `credencial` e a variável `SEGREDO_SISTEMA`.

O script `npm run test:cron` referencia `tests/cron.test.mjs`, que não está
versionado nesta branch. Ele não pode validar a rotina nesse estado; use
`npm run build` para conferir a compilação e valide os fluxos em um ambiente
com o schema e os serviços correspondentes.

Referências: [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) e
[autenticação e acompanhamento](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
