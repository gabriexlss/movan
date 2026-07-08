import express, { Application } from 'express';
import cors from 'cors';
import mainRoutes from './mainRoutes.js';

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

// Necessário para o servidor conseguir ler o corpo das requisições (req.body) em JSON
app.use(express.json());

// conecta o app com a execução do arquivo de rotas, onde estão todas as rotas do servidor
app.use('/', mainRoutes);

export default app;
