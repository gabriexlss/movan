# 🚐 Movan

O Movan é uma plataforma web desenvolvida para centralizar e otimizar o gerenciamento de serviços de transporte escolar, além de auxiliar na divulgação dos serviços prestados . 

Nos últimos anos, pequenos empreendedores têm investido cada vez mais na informatização, processo essencial para elevar a competitividade, agilizar tarefas e cortar custos . O Movan nasce para trazer essa modernização para o setor de transporte escolar, oferecendo uma solução acessível e adaptável a diferentes realidades profissionais .

## 🛑 O Problema

Muitos profissionais que atuam no transporte escolar enfrentam dificuldades diárias na organização de suas atividades por não utilizarem sistemas integrados . Os principais desafios identificados incluem:

- **Descentralização de Dados:** Informações cruciais, como endereço, contato e documentação das crianças, ficam distribuídas em diferentes meios, dificultando o acesso rápido e organizado . Isso gera falhas de comunicação e risco de perda de informações importantes .
- **Rotas Não Otimizadas:** A definição de trajetos sem o auxílio de ferramentas de mapas e trânsito em tempo real resulta em percursos mais longos, maior gasto de combustível e atrasos no transporte dos alunos .
- **Gestão Financeira Manual:** A utilização de múltiplos métodos manuais ou plataformas isoladas torna o controle financeiro confuso, dificultando o acompanhamento de pagamentos, despesas e lucros .

## 🎯 Objetivos e Solução

O projeto busca resolver essas questões por meio de uma interface simples, intuitiva e acessível, promovendo maior autonomia para o motorista gerir o seu negócio . 

As principais funcionalidades do sistema englobam:
- **Cadastro e Gestão:** Organização de dados de responsáveis e alunos para acesso rápido e eficiente, reduzindo erros operacionais .
- **Planejamento Inteligente:** Integração com serviços de mapas interativos para a visualização do melhor caminho e otimização dos trajetos .
- **Contratos e Finanças:** Funcionalidades para geração e assinatura ágil de contratos, além de um painel completo para verificação de pagamentos e organização da saúde financeira do negócio .
- **Divulgação:** Ferramentas para ampliar a visibilidade do serviço do motorista, auxiliando na captação de novos clientes .

## 🚀 Tecnologias Utilizadas

A aplicação adota a arquitetura cliente-servidor para garantir estabilidade e processamento eficiente :

### Frontend
- **React.js**: Biblioteca baseada em componentes para a construção de uma interface dinâmica, moderna e reutilizável .
- **Vite**: Ferramenta de construção rápida e servidor de desenvolvimento local para otimizar o fluxo de trabalho .
- **HTML5 & CSS3**: Estruturação e criação de um ambiente visual organizado, responsivo e acessível .
- **LeafLet**: Biblioteca para integração e renderização de mapas interativos diretamente na interface do usuário .

### Backend
- **Node.js**: Ambiente de execução JavaScript no lado do servidor .
- **Express.js**: Framework para facilitar a criação de rotas, APIs e organização da lógica de negócio .
- **TypeScript**: Adição de tipagem estática que garante maior padronização, legibilidade e segurança durante o desenvolvimento do servidor .
- **MySQL**: Sistema de Gerenciamento de Banco de Dados Relacional (SGBDR) responsável por armazenar dados de clientes, rotas e registros financeiros com integridade por meio da linguagem SQL .
- **API OSRM (Open Source Routing Machine)**: Integração para processamento e cálculo otimizado de rotas no servidor .

## 🧪 Qualidade e Testes

Para assegurar uma solução confiável, o projeto adota o modelo de avaliação proposto por David Garvin, que analisa as dimensões de qualidade de produtos e serviços . São considerados critérios fundamentais como desempenho, confiabilidade e usabilidade , apoiados por:
- Testes funcionais e de integração da comunicação entre as partes do sistema .
- Testes de usabilidade diretos com o cliente final para garantir a adequação da interface à realidade do transporte escolar .

## 🛠️ Estrutura do Projeto

O repositório está dividido em duas partes principais:

- `/client`: Contém todo o código do frontend e da interface (React + Vite + LeafLet).
- `/server`: Contém a API, lógica de negócio, rotas e conexão com o banco (Express + Node.js + TypeScript + OSRM).

## 🏁 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado.
- Banco de dados MySQL configurado.

### Configuração do Backend
1. Navegue até a pasta `server`:
   `cd server`

2. Instale as dependências:
   `npm install`

3. Configure o arquivo `.env` com suas credenciais do banco de dados MySQL e demais chaves da API.

4. Inicie o servidor:
   `npm start`

### Configuração do Frontend
1. Navegue até a pasta `client`:
   `cd client`

2. Instale as dependências:
   `npm install`

3. Configure o arquivo `.env` com as variáveis de ambiente necessárias para o frontend (como a URL da sua API local).

4. Inicie o ambiente de desenvolvimento:
   `npm run dev`

---
*Este projeto é o Trabalho de Conclusão de Curso (TCC) do curso técnico de Desenvolvimento de Sistemas da ETEC Jardim Ângela .*
