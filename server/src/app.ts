import express, { Application } from 'express';
import mainRoutes from './mainRoutes.js';

const app: Application = express();

// Necessário para o servidor conseguir ler o corpo das requisições (req.body) em JSON
app.use(express.json());

// conecta o app com a execução do arquivo de rotas, onde estão todas as rotas do servidor
app.use('/', mainRoutes);

export default app;
