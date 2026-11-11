# 🚐 Movan

**Gestão de transporte escolar em uma plataforma web.**

O Movan é um Trabalho de Conclusão de Curso de Desenvolvimento de Sistemas da **ETEC Jardim Ângela**, desenvolvido para apoiar a organização do trabalho de motoristas de transporte escolar.

A proposta é centralizar informações de alunos, responsáveis e escolas, facilitar a preparação de contratos e apoiar o acompanhamento financeiro e o planejamento de trajetos.

> **Projeto em desenvolvimento.** As funcionalidades estão distribuídas entre a `main` e branches de trabalho. A existência de uma tela ou endpoint não significa que o fluxo completo já esteja integrado. O estado abaixo foi conferido em **29/10/2026**.

## O problema

O uso de anotações, mensagens e planilhas separadas dificulta a consulta dos dados dos clientes e o acompanhamento das atividades do transporte escolar. O Movan busca reunir essas informações em uma interface acessível, reduzindo retrabalho e facilitando a gestão do serviço.

## Funcionalidades e estágio atual

| Módulo | Estado da implementação | Onde acompanhar |
| --- | --- | --- |
| Conta do motorista | Cadastro com CPF ou CNPJ, login, verificação de e-mail, recuperação de senha, edição de perfil, integração com Google e exclusão de conta com período de retenção de 30 dias. | `main` |
| Alunos, responsáveis e escolas | API de cadastro, consulta, edição e exclusão. As telas estão em desenvolvimento; criação e listagem de responsáveis e escolas já possuem integração na branch específica. | `gestaoClientes` e `feat/integracaoClientes` |
| Contratos e cláusulas | API de rascunhos, cláusulas padrão e personalizadas, ordenação, consulta com cláusulas e PDF e cancelamento de contratos ativos ou aguardando assinatura. | `contratos` |
| Documentos e assinaturas | API de geração de PDF com assinatura do motorista, link válido por 15 dias, assinatura do responsável, PDF com ambas as imagens e recriação de link. A integração das telas segue em desenvolvimento. | API em `contratos`; telas em `feat/telaContratos` |
| Financeiro | Telas e interações em desenvolvimento, ainda com dados de exemplo. | `main`, `fix/errosTelaFinanc` e `feat/telaContratos` |
| Rotas | Funcionalidade planejada; a página existente ainda não implementa o planejamento de trajetos. A branch local `rotas` aponta para o mesmo commit de `contratos` nesta revisão. | `feat/telaContratos` e branch local `rotas` |

As branches de frontend e backend podem conter partes diferentes de um mesmo módulo. Consulte as alterações e os pull requests antes de escolher uma versão para executar.

## Tecnologias

| Camada | Tecnologias utilizadas |
| --- | --- |
| Frontend | React 19, Vite, JavaScript/JSX, CSS Modules, React Router, Axios e Zod. |
| Interface | React Icons, React Hot Toast, Chart.js e react-chartjs-2. |
| API | Node.js, Express e TypeScript com tipagem estrita. |
| Banco de dados | PostgreSQL, com o driver `pg`, consultas parametrizadas e transações. |
| Autenticação | bcrypt, JSON Web Token em cookies, @react-oauth/google e google-auth-library. |
| E-mail | Resend. |
| Limitação de requisições | express-rate-limit. |
| Documentos e arquivos | Multer, Sharp, Cloudflare R2 com o SDK S3, @react-pdf/renderer e pdf-lib, na branch `contratos`. |
| Ferramentas e infraestrutura | ESLint, GitHub Actions com PR Agent e configurações de hospedagem na Vercel. |

## Estrutura do repositório

| Caminho | Conteúdo |
| --- | --- |
| [`client/`](./client/) | Aplicação React, páginas, componentes, hooks, serviços e estilos. |
| [`server/src/`](./server/src/) | API Express: rotas, controllers, middlewares, validações, conexão com o banco e utilitários. |
| [`docs/`](./docs/) | Materiais e documentação acadêmica do TCC. |
| [`.github/workflows/`](./.github/workflows/) | Automações do GitHub Actions. |

A documentação da API está no repositório independente [movandocs](https://github.com/gabriexlss/movandocs), com páginas em `content/`, e é disponibilizada em [devdocs.movan.org](https://devdocs.movan.org). O serviço de PDF está em `server/src/services/` na branch `contratos`.

Esta revisão conferiu `main@802e94c`, `gestaoClientes@2e6a555`, `feat/integracaoClientes@bf6db22`, `contratos@19c32ed`, `feat/telaContratos@1dc9cc5`, `gestaoFinanceira@d21b0b6` e `fix/errosTelaFinanc@483eb93`. A branch de assinatura foi incorporada em `contratos` pelo PR #120; use essa branch para executar a API completa de contratos.

## Executando localmente

### Pré-requisitos

- **Git**.
- **Node.js 22.12 ou superior** e **npm**. O Vite desta versão também aceita Node.js `^20.19.0`.
- Uma instância de **PostgreSQL** com o schema correspondente à branch escolhida.
- Credenciais do **Resend** para os fluxos de e-mail e um cliente **Google OAuth** para testar a autenticação Google.
- Para os documentos da branch de assinatura: um bucket **Cloudflare R2** e suas credenciais.

> **Banco de dados:** atualmente, o repositório não disponibiliza migrations ou um script de criação das tabelas e views. Solicite à equipe o schema correspondente à branch antes de testar os fluxos com persistência. Executar a API não cria o banco automaticamente.

### 1. Clonar o projeto

```bash
git clone https://github.com/gabriexlss/movan.git
cd movan
```

O clone utiliza a `main`. Para trabalhar em outro módulo, selecione a branch antes de instalar suas dependências:

```bash
git switch feat/integracaoClientes
```

### 2. Configurar o backend

```bash
cd server
npm install
cp .env.example .env
```

No Windows, também é possível duplicar `.env.example` pelo explorador de arquivos e renomear a cópia para `.env`.

Edite `server/.env` conforme o ambiente:

| Variável | Finalidade |
| --- | --- |
| `PORT` | Porta da API. O padrão é `3000`. |
| `DATABASE_URL` | String de conexão com o PostgreSQL. |
| `CORS_ORIGEM` | Origens autorizadas, em formato de array JSON, como `["http://localhost:5173"]`. |
| `SEGREDO_JWT` | Segredo utilizado para assinar e verificar os tokens de autenticação. |
| `RESEND_API_KEY` | Chave do Resend para envio de e-mails. |
| `GOOGLE_CLIENT_ID` | ID do cliente Google OAuth utilizado pelo backend. |
| `SEGREDO_SISTEMA` | Credencial das rotas administrativas do sistema. |
| `CRON_SECRET` | Segredo utilizado na autenticação da limpeza agendada. |

Exemplo de configuração local, substituindo os valores indicados:

```dotenv
PORT=3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/movan
CORS_ORIGEM=["http://localhost:5173"]
SEGREDO_JWT=substitua_por_um_segredo_aleatorio
```

Os fluxos de e-mail utilizam o remetente `noreply@movan.org`. O envio exige uma configuração do Resend autorizada para esse domínio, ou a adaptação do remetente para um domínio verificado do seu ambiente.

Inicie a API em modo de desenvolvimento:

```bash
npm run dev
```

Por padrão, ela estará em `http://localhost:3000`. A rota `GET /health` retorna:

```json
{ "msg": "OK" }
```

Essa resposta confirma que a API está atendendo; ela não verifica a conexão com o banco nem a configuração dos serviços externos.

Para executar o JavaScript compilado:

```bash
npm run build
npm start
```

### 3. Configurar o frontend

Em outro terminal, a partir da raiz do repositório:

```bash
cd client
npm install
cp .env.example .env
```

Configure `client/.env`:

```dotenv
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=seu_client_id_do_google
```

Use o mesmo ID de cliente Google configurado no backend. Cadastre também a origem local do frontend nas origens JavaScript autorizadas do cliente OAuth.

```bash
npm run dev
```

Acesse a URL informada pelo Vite, normalmente `http://localhost:5173`. Se ele utilizar outra porta, ajuste `CORS_ORIGEM` no backend e a configuração do cliente Google. Reinicie os processos após alterar os arquivos `.env`.

### Configuração adicional do R2

Na branch `contratos`, preencha também no backend:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `CDN_URL`

`CDN_URL` deve ser a URL HTTPS base usada para disponibilizar os arquivos do bucket. O backend normaliza a barra final ao montar URLs. O bucket armazena assinaturas WebP (até 1 MiB por envio) e PDFs; a limpeza definitiva de usuários também remove seus objetos sob `motoristas/<id>/`.

Mantenha os segredos no backend. Variáveis com o prefixo `VITE_` são incorporadas ao frontend e devem conter apenas informações públicas.

## Comandos disponíveis

Execute os comandos dentro da pasta indicada:

| Pasta | Comando | Descrição |
| --- | --- | --- |
| `client/` | `npm run dev` | Inicia o frontend em desenvolvimento. |
| `client/` | `npm run build` | Gera o frontend em `dist/`. |
| `client/` | `npm run preview` | Disponibiliza localmente o build do frontend. |
| `client/` | `npm run lint` | Executa o ESLint. |
| `server/` | `npm run dev` | Inicia a API com recarregamento via `tsx`. |
| `server/` | `npm run build` | Compila o TypeScript para `dist/`. |
| `server/` | `npm start` | Executa `dist/server.js`; requer compilação prévia. |
| `server/` | `npm run lint` | Executa o ESLint. |
| `server/` | `npm run lint:fix` | Aplica as correções automáticas disponíveis no ESLint. |

O projeto ainda não possui uma suíte de testes automatizados versionada. O script `test:cron` presente em algumas branches referencia um arquivo de teste ainda ausente; ele não representa uma suíte executável no estado documentado. A revisão com PR Agent complementa a revisão de código e deve ser acompanhada de compilação, lint e validação funcional.

## Branches de desenvolvimento

| Branch | Foco |
| --- | --- |
| [`main`](https://github.com/gabriexlss/movan/tree/main) | Base principal do projeto. |
| [`gestaoClientes`](https://github.com/gabriexlss/movan/tree/gestaoClientes) | Gestão de alunos, responsáveis e escolas. |
| [`feat/integracaoClientes`](https://github.com/gabriexlss/movan/tree/feat/integracaoClientes) | Integração das telas de clientes com a API. |
| [`contratos`](https://github.com/gabriexlss/movan/tree/contratos) | API de clientes, contratos, cláusulas, PDFs, assinaturas e cancelamento. |
| [`feat/telaContratos`](https://github.com/gabriexlss/movan/tree/feat/telaContratos) | Interface do fluxo de contratos. |
| [`fix/errosTelaFinanc`](https://github.com/gabriexlss/movan/tree/fix/errosTelaFinanc) | Ajustes nas telas financeiras e em componentes da interface. |
| [`gestaoFinanceira`](https://github.com/gabriexlss/movan/tree/gestaoFinanceira) | Branch histórica de desenvolvimento, divergente da base atual. |

## Hospedagem e manutenção

O frontend e o backend possuem configurações para hospedagem na Vercel. O arquivo [`client/vercel.json`](./client/vercel.json) configura o redirecionamento das rotas da aplicação para `index.html`.

O arquivo [`server/vercel.json`](./server/vercel.json) agenda a limpeza de contas marcadas para exclusão há pelo menos 30 dias. A configuração do cron e de sua autenticação está descrita em [`server/README.md`](./server/README.md).

## Contribuição

1. Escolha a branch relacionada ao módulo e crie uma branch para a alteração.
2. Configure o ambiente e valide o fluxo afetado com o banco e os serviços necessários.
3. Execute o lint e o build das partes alteradas.
4. Abra um pull request descrevendo a mudança e como ela foi validada.

Ao implementar ou integrar um módulo, atualize a tabela de funcionalidades e as páginas correspondentes em `movandocs/content/`. Registre a branch e o commit em `Versões e Branches.md` e execute `npm run check` e `npm run build` no repositório de documentação.

---

Desenvolvido como **Trabalho de Conclusão de Curso de Desenvolvimento de Sistemas da ETEC Jardim Ângela**.
