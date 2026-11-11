export const horarioValido = (valor) => /^([01]\d|2[0-3]):[0-5]\d$/.test(valor)

export const valorNoRelogio = (x, y, etapa) => {
    const volta = 2 * Math.PI
    const angulo = (Math.atan2(y, x) + Math.PI / 2 + volta) % volta

    if (etapa === 'minuto') return Math.round(angulo / volta * 60) % 60

    const hora = Math.round(angulo / volta * 12) % 12
    return Math.hypot(x, y) < .34 ? (hora === 0 ? 0 : hora + 12) : (hora === 0 ? 12 : hora)
}

export const mascararHorario = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 4)
    return numeros.length > 2 ? `${numeros.slice(0, 2)}:${numeros.slice(2)}` : numeros
}
