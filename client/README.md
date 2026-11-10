# Frontend do Movan

Aplicação React com Vite, React Router, Axios, CSS Modules, Zod e gráficos com Chart.js.

## Executar localmente

Selecione a branch do módulo antes de instalar as dependências. Dentro de `client/`:

```bash
npm install
cp .env.example .env
```

Configure o arquivo `.env`:

```dotenv
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=seu_client_id_do_google
```

Use o mesmo ID de cliente Google configurado na API. Autorize a origem local no cliente OAuth e configure `CORS_ORIGEM` no backend para permitir a URL do frontend.

```bash
npm run dev
```

O Vite informa a URL local, normalmente `http://localhost:5173`. Reinicie o processo ao alterar variáveis de ambiente. O serviço Axios utiliza `withCredentials: true` para enviar o cookie HTTP-only `token` da API.

## Módulos e branches

Estado conferido em **29/10/2026**:

| Branch | Funcionalidades |
| --- | --- |
| `main@802e94c` | Conta, autenticação local e Google, verificação e recuperação de senha, perfil e painel financeiro com dados de exemplo. |
| `contratos@19c32ed` | Incorpora as telas de gestão de clientes; o fluxo da API de contratos está implementado no backend dessa branch. |
| `feat/integracaoClientes@bf6db22` | Integra criação e listagem de responsáveis e escolas com a API, com autocomplete de endereços. |
| `feat/telaContratos@1dc9cc5` | Telas `/contratos`, `/contratos/clausulas`, `/contratos/link` e `/contrato/assinatura` em desenvolvimento. A página `/rota` ainda não implementa planejamento. |
| `fix/errosTelaFinanc@483eb93` | Ajustes de apresentação e interações das páginas financeiras. |

As telas de contratos não representam uma integração completa com a API. O backend retorna links públicos no formato `https://www.movan.org/assinar/:token`; a rota pública correspondente ainda não está declarada em `App.jsx` da branch de telas conferida.

A referência dos endpoints está no repositório [movandocs](https://github.com/gabriexlss/movandocs), nas páginas `content/`, incluindo os commits e a disponibilidade por branch. As instruções completas do ambiente estão no [README principal](../README.md).

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento. |
| `npm run build` | Build de produção em `dist/`. |
| `npm run preview` | Prévia local do build. |
| `npm run lint` | Verificação com ESLint. |

`vercel.json` redireciona as rotas da aplicação para `index.html` na hospedagem.
