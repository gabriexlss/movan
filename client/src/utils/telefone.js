export const formatarTelefone = (valor = '') => {
    const numeros = String(valor ?? '').replace(/\D/g, '').slice(0, 11)
    if (!numeros) return ''
    if (numeros.length <= 2) return `(${numeros}`

    const numero = numeros.slice(2)
    const tamanhoPrefixo = numeros.length > 10 ? 5 : 4
    const prefixo = numero.slice(0, tamanhoPrefixo)
    const sufixo = numero.slice(tamanhoPrefixo)

    return `(${numeros.slice(0, 2)}) ${prefixo}${sufixo ? `-${sufixo}` : ''}`
}
