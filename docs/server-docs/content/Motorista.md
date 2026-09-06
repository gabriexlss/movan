Endpoints referentes à criação, edição, autenticação, exclusão e visualização da conta do motorista na plataforma.

### Conta & Autenticação Local

- [[Criar Motorista]]: Endpoint para criar uma nova conta de motorista.
- [[Login do Motorista]]: Endpoint para realizar login na conta do motorista.
- [[Logout do Motorista]]: Endpoint para deslogar a conta do motorista.
- [[Obter Dados]]: Endpoint para obter as informações e dados do perfil do motorista logado.
- [[Encerrar Conta]]: Endpoint para agendar o encerramento (soft delete) da conta do motorista.

### Verificação de Conta

- [[Enviar Código]]: Endpoint referente ao envio (ou reenvio) do código de verificação de conta para o e-mail do motorista.
- [[Verificar Conta]]: Endpoint referente à verificação da conta do motorista por meio do código enviado ao e-mail.

### Edição de Perfil

- [[Editar Conta - Enviar Código]]: Endpoint para enviar o código de verificação ao novo e-mail antes de alterá-lo.
- [[Editar Conta]]: Endpoint para editar os dados da conta do motorista (nome, CNPJ, senha e e-mail).

### Recuperação de Senha

- [[Recuperar Conta - Enviar Código]]: Endpoint referente ao envio do código para recuperação da senha do motorista.
- [[Recuperar Conta - Alterar Senha]]: Endpoint referente à alteração da senha do motorista usando o código de recuperação enviado.

### Autenticação & Vinculação Google

- [[Autenticar Google]]: Endpoint para realizar login/autenticação utilizando o token do Google OAuth2.
- [[Criar Conta Google]]: Endpoint para criar uma nova conta de motorista vinculada ao Google ID.
- [[Vincular Google]]: Endpoint para vincular a conta do Google à conta do motorista atualmente logado.
- [[Desvincular Google]]: Endpoint para desvincular a conta do Google da conta do motorista logado.
