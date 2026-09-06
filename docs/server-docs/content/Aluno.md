Endpoints autenticados para cadastrar, editar, excluir e consultar os alunos vinculados ao motorista logado.

### Gerenciamento de alunos

- [[Criar Aluno]]: Cadastra um aluno e o vincula ao motorista autenticado.
- [[Editar Aluno]]: Altera os dados de um aluno pertencente ao motorista autenticado.
- [[Excluir Aluno]]: Exclui um aluno pertencente ao motorista autenticado.
- [[Listar Alunos]]: Retorna uma lista resumida dos alunos do motorista autenticado.
- [[Obter Dados do Aluno]]: Retorna todos os dados de um aluno específico.

Todas as rotas deste grupo são protegidas e exigem o cookie `token` com um JWT de sessão válido.
