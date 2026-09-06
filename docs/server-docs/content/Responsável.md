Endpoints autenticados para cadastrar, editar, excluir e consultar os responsáveis vinculados ao motorista logado.

### Gerenciamento de responsáveis

- [[Criar Responsável]]: Cadastra um responsável e o vincula ao motorista autenticado.
- [[Editar Responsável]]: Altera os dados de um responsável pertencente ao motorista autenticado.
- [[Excluir Responsável]]: Exclui um responsável pertencente ao motorista autenticado.
- [[Listar Responsáveis]]: Retorna uma lista resumida dos responsáveis do motorista autenticado.
- [[Obter Dados do Responsável]]: Retorna todos os dados de um responsável específico.

Todas as rotas deste grupo são protegidas e exigem o cookie `token` com um JWT de sessão válido.
