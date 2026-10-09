# Servidor Movan

## Limpeza diária de contas na Vercel

O arquivo `vercel.json` agenda `GET /system/limpeza-usuarios` diariamente às
06h UTC, equivalente às 03h em São Paulo. A rota reutiliza a rotina de limpeza
existente, que apaga definitivamente contas marcadas para exclusão há pelo menos
30 dias. No plano Hobby, a execução pode ocorrer entre 03h e 03h59.

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

Execute `npm run test:cron` para compilar e validar o agendamento, a autenticação
e o encaminhamento para a limpeza, usando consultas simuladas sem acessar o banco.

Referências: [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) e
[autenticação e acompanhamento](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
