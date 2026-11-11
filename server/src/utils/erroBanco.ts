export const possuiCodigoPostgres = (erro: unknown, codigo: string): boolean => {
    if (typeof erro !== "object" || erro === null || !("code" in erro)) {
        return false
    }

    return erro.code === codigo
}
