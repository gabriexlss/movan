Endpoint autenticado para editar os dados do perfil do motorista.

- Rota: /motorista/editar
- Método: PATCH
- Cookie: `token` configurado

Nome, CNPJ e senha são opcionais. Para alterar o e-mail, primeiro solicite o código em `/motorista/editar/enviar-codigo` e envie `email` e `cod` juntos.

```json
{
  "email": "novoemail@exemplo.com",
  "cod": "123456"
}
```

O código expira em cinco minutos, só pode ser usado uma vez e é válido somente para o e-mail ao qual foi enviado.

- 200: Dados alterados com sucesso.
- 400: Dados inválidos ou código ausente ao alterar e-mail.
- 401: Código inválido ou expirado.
- 409: E-mail já cadastrado.
