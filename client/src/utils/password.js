export const requisitosSenha = (senha) => [
    { texto: 'De 8 a 100 caracteres', atendido: senha.length >= 8 && senha.length <= 100 },
    { texto: 'Inclui letras maiúsculas e minúsculas', atendido: /[A-Z]/.test(senha) && /[a-z]/.test(senha) },
    { texto: 'Inclui números e caracteres especiais', atendido: /\d/.test(senha) && /[^\w\s]/.test(senha) },
]

export const senhaValida = (senha) => requisitosSenha(senha).every((requisito) => requisito.atendido)
