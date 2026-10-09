import { rateLimit } from "express-rate-limit";

// todas os rate limits
export const limitarRequisicoes = {
    global: () => requisicoes({tempo: 60 * 1000, limite: 300}), // 300 requisições por minuto
    login: () => requisicoes({tempo: 5 * 60 * 1000, limite: 15}), // 15 requisições a cada 5 minutos
    cadastro: () => requisicoes({tempo: 30 * 60 * 1000, limite: 10}), // 10 requisições a cada 30 minutos
    get: () => requisicoes({tempo: 60 * 1000, limite: 60}), // 60 requisições por minuto
    codigoEmail: () => requisicoes({tempo: 5 * 60 * 1000, limite: 1}), // 1 requisição a cada 5 minutos
    editar: () => requisicoes({tempo: 60 * 1000, limite: 5}), // 5 requisição a cada minuto
};

interface requisicoesProps {
    tempo: number,
    limite: number
}
// função pra criar o rate limit de fato.
function requisicoes({ tempo, limite }: requisicoesProps) {
    return rateLimit({
        windowMs: tempo,
        limit: limite,

        standardHeaders: true,
        legacyHeaders: false,

        message: {
            msg: "Muitas requisições. Tente novamente mais tarde."
        }
    });
}
