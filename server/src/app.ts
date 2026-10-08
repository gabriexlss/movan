import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mainRoutes from './mainRoutes.js';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Processa as origens do CORS a partir do .env (com tratamento de erro para evitar crash)
const allowedOrigins = (() => {
  const originEnv = process.env['CORS_ORIGEM'];
  if (!originEnv) return [];
  try {
    return JSON.parse(originEnv);
  } catch {
    // Caso não seja um JSON válido (ex: uma única string), retorna a string diretamente
    return originEnv;
  }
})();

// Habilita o básico de CORS permitindo as origens configuradas
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));
// Necessario para o servidor conseguir ler cookies
app.use(cookieParser())

// Necessário para o servidor conseguir ler o corpo das requisições (req.body) em JSON
app.use(express.json());

// conecta o app com a execução do arquivo de rotas, onde estão todas as rotas do servidor
app.use('/', mainRoutes);

// Mantém as respostas de erro da API em JSON mesmo fora dos controllers.
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    msg: 'Rota não encontrada.'
  });
});

app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const erroHttp = erro as { status?: unknown; type?: unknown };

  if (erroHttp.type === 'entity.parse.failed') {
    return res.status(400).json({
      msg: 'JSON inválido.'
    });
  }

  if (erroHttp.status === 413 || erroHttp.type === 'entity.too.large') {
    return res.status(413).json({
      msg: 'Corpo da requisição excede o limite permitido.'
    });
  }

  console.error('Erro não tratado pela aplicação:', erro);
  return res.status(500).json({
    msg: 'Erro interno do servidor.'
  });
});

export default app;
