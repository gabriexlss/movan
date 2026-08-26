Endpoints autenticados para cadastrar, editar, excluir e consultar as escolas vinculadas ao motorista logado.

### Gerenciamento de escolas

- [[Criar Escola]]: Cadastra uma escola e a vincula ao motorista autenticado.
- [[Editar Escola]]: Altera os dados de uma escola pertencente ao motorista autenticado.
- [[Excluir Escola]]: Exclui uma escola pertencente ao motorista autenticado.
- [[Listar Escolas]]: Retorna uma lista resumida das escolas do motorista autenticado.
- [[Obter Dados da Escola]]: Retorna todos os dados de uma escola específica.

Todas as rotas deste grupo são protegidas e exigem o cookie `token` com um JWT de sessão válido.
