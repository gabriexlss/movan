import { Request, Response } from "express";
import { database } from "../db/postgre.js";
import { CriarRota, Rota } from "../models/rotas/rota.js";

export const controllerRotas = {
    // gera todas as rotas assim que o motorista é criado
    gerarRotas: async (motoristaID: number): Promise<void> => {

        // iniciando conexão ao banco de dados.
        const cliente = await database.connect().catch(() => {
            throw new Error("Erro ao conectar ao banco de dados.")
        })
        
        // iniciando array com as rotas que vão ser criadas em CADA DIA DA SEMANA.
        const Rotas: CriarRota[] = []

        // for demoniaco que fiz enquanto tava alucinando pra montar um array sem ficar repetindo codigo, sei la, ta funcionando então nao mexe
        for (let i = 1; i <= 6; i++) {
            const resto = i % 2
            Rotas.push(
                {
                    nome: undefined,
                    sentido: resto === 0 ? "VOLTA" : "IDA",
                    ativa: true,
                    motorista_id: motoristaID,
                    turno: i <= 2 ? "MANHA" : i <= 4 ? "TARDE" : "NOITE"
                }
            )
        }

        const RotasCriadas: Rota[] = []
        try {
            // iniciando transação
            await cliente.query('BEGIN')

            // fazendo varias querys pra inserir todas as rotas pra cada dia da semana, ou seja, 5x6. ja que cada dia da semana tem 6 rotas diferentes
            for(let i = 1; i <= 5; i++){
                // for dentro do for kkkkkkkkkkkkk, me julguem mas nao pensei numa solução melhor
                for(const Rota of Rotas){
                    const RotaCriada = await cliente.query<Rota>(
                        `
                        INSERT INTO rota
                        (nome, sentido, ativa, motorista_id, turno)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *
                        `,
                        [Rota.nome, Rota.sentido, Rota.ativa, Rota.motorista_id, Rota.turno]
                    )
                    RotasCriadas.push(RotaCriada.rows[0]!)
                }
            }

            // inserindo agr no dia da semana as rotas.
            let i = 1
            for(const Rota of RotasCriadas){
                // PERDAO PRA QUEM TENTAR ENTENDER ISSO, mas resumindo, vai definir com base no valor de i, se é segunda, terça, quarta, quinta ou sexta.
                const diaSemana = i > 0 && i <= 6 ? 2 : i > 6 && i <= 12 ? 3 : i > 12 && i <= 18 ? 4 : i > 18 && i <= 24 ? 5 : 6
                await cliente.query(
                    `
                    INSERT INTO rota_dia_semana
                    (rota_id, dia_semana)
                    VALUES ($1, $2)
                    `,
                    [Rota.id, diaSemana]
                )
                i++
            }
            // se chegar tudo corretamente, retorna
            return
        }catch(erro){
            await cliente.query('ROLLBACK')
            throw new Error(`Erro ao criar registros das rotas durante criação do motorista`, {cause: erro})
        }finally{
            cliente.release()
        }
    }
}