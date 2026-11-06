import { v1, protos } from '@googlemaps/routeoptimization'
import { database } from '../db/postgre.js';
import { Rota } from '../models/rotas/rota.js';
import { PontoRota } from '../models/rotas/pontoRota.js';
import { Aluno } from '../models/aluno.model.js';
import { Escola } from '../models/escola/escola.model.js';
import { EscolaTurno } from '../models/escola/turno.model.js';
import { Request } from 'express';
import { timeToTimestamp } from '../utils/converterTimestamp.js';
import { Motorista } from '../models/motorista/motorista.model.js';

// importação dos tipos
type IOptimizeToursRequest = protos.google.maps.routeoptimization.v1.IOptimizeToursRequest;
type IShipment = protos.google.maps.routeoptimization.v1.IShipment;
type IVehicle = protos.google.maps.routeoptimization.v1.IVehicle;

// função
export const otimizarRota = async (rotaID: number, req: Request) => {

    // primeiro pego os dados necessarios.
    const motoristaID = req.userId
    const { rows: [motorista] } = await database.query<Motorista>(
        `
        SELECT * FROM motorista
        WHERE id = $1
        `,
        [motoristaID]
    )
    // pegando as infos da rota
    const { rows: [rota] } = await database.query<Rota>(
        `
        SELECT * FROM rota
        WHERE id = $1
        `,
        [rotaID]
    )
    if (!rota) {
        throw new Error('ROTA_NOT_FOUND')
    }
    // pegando todos os pontos daquela rota.
    const { rows: pontosRota } = await database.query<PontoRota>(
        `
        SELECT * FROM ponto_rota
        WHERE rota_id = $1
        ORDER BY ordem ASC
        `,
        [rotaID]
    )
    if (pontosRota.length < 1) {
        throw new Error('PONTOS_NOT_FOUND')
    }
    // pega os dados do aluno daquele motorista.
    const { rows: alunos } = await database.query<Aluno>(
        "SELECT * FROM aluno WHERE motorista_id = $1",
        [motoristaID]
    )
    if (alunos.length < 1) {
        throw new Error('ALUNO_NOT_FOUND')
    }
    // agora pega os dados da escola.
    const { rows: escolas } = await database.query<Escola>(
        "SELECT * FROM escola WHERE motorista_id = $1",
        [motoristaID]
    )
    if (escolas.length < 1) {
        throw new Error('ESCOLA_NOT_FOUND')
    }
    // agora pega os dados do turno daquela escola.
    const escolasIDs = escolas.map(e => e.id)
    const { rows: turnosEscolas } = await database.query<EscolaTurno>(
        "SELECT * FROM escola_turno WHERE escola_id = ANY($1::int[])",
        [escolasIDs]
    )
    if (turnosEscolas.length < 1) {
        throw new Error('TURNO_NOT_FOUND')
    }

    // crio uma constante pra guardar os ponto rota no formato que o route optimization aceita e uma variavel pra guardar os pontosRota filtrados
    const shipmentAlunos: IShipment[] = []
    // array que define os turnos válidos, no caso, os turnos q serão utilizados.
    const turnosValidos: EscolaTurno[] = []
    let pontosRotaFiltrados: PontoRota[]

    /* 
    o google só aceita as "mercadorias" que no caso são os alunos, então se a rota for de ida, so vamos ter
    os pontos de embarque que são os alunos que vão estar entrando na van, 'embarcando', se a rota for de volta, só vamos ter os alunos que vão 
    estar desembarcando, ou no caso, saindo da escola 
     */
    if (rota.sentido === 'IDA') {
        pontosRotaFiltrados = pontosRota.filter(p => p.tipo_ponto === 'EMBARQUE')
    } else {
        pontosRotaFiltrados = pontosRota.filter(p => p.tipo_ponto === 'DESEMBARQUE')
    }



    for (const pontoRota of pontosRotaFiltrados) {
        // filtrando pra obter somente os dados que preciso.
        const aluno = alunos.find(a => a.id === pontoRota.aluno_id)!
        const escola = escolas.find(e => e.id === aluno.escola_id)!
        const turno = turnosEscolas.find(t => t.id === aluno.escola_turno_id)!

        // convertendo o horario de saida e entrada de TIME pra timestamp unix q é oq o fresco do google aceita
        const horaSaida = timeToTimestamp(turno.hora_saida)
        const horaEntrada = timeToTimestamp(turno.hora_entrada)

        if (!turnosValidos.some(t => t.id === aluno.escola_turno_id)) {
            turnosValidos.push(turno)
        }

        // colocando um novo aluno no array
        shipmentAlunos.push(
            {
                label: `aluno_${aluno.id}`,
                pickups: [
                    {
                        label: rota.sentido === 'IDA' ? `casa_aluno_${aluno.id}` : `escola_${escola.id}`,
                        arrivalLocation: {
                            latitude: rota.sentido === 'IDA' ? Number(aluno.latitude) : Number(escola.latitude),
                            longitude: rota.sentido === 'IDA' ? Number(aluno.longitude) : Number(escola.longitude)
                        },
                        duration: { seconds: 120 },
                        ...(rota.sentido === 'VOLTA' ? {
                            timeWindows: [
                                {
                                    startTime: {
                                        ...horaSaida,
                                        seconds: horaSaida.seconds - (10 * 60) // traduzindo essa macacada, basicamente se a rota for saida, a janela pro motorista pegar o aluno na escola começa 10 minutos antes do horario e termina no horario de termino
                                    },
                                    endTime: horaSaida
                                }
                            ]
                        } : {}
                        )
                    }
                ],
                deliveries: [
                    {
                        label: rota.sentido === 'IDA' ? `escola_${escola.id}` : `casa_aluno_${aluno.id}`,
                        arrivalLocation: {
                            latitude: rota.sentido === 'IDA' ? Number(escola.latitude) : Number(aluno.latitude),
                            longitude: rota.sentido === 'IDA' ? Number(escola.longitude) : Number(aluno.longitude)
                        },
                        duration: { seconds: 120 },
                        ...(rota.sentido === 'IDA' ? {
                            timeWindows: [
                                {
                                    startTime: {
                                        ...horaEntrada,
                                        seconds: horaEntrada.seconds - (10 * 60) // traduzindo essa macacada, basicamente se a rota for saida, a janela pro motorista pegar o aluno na escola começa 10 minutos antes do horario e termina no horario de termino
                                    },
                                    endTime: horaEntrada
                                }
                            ]
                        } : {}
                        )
                    }
                ],
                loadDemands: {
                    assentos: { amount: 1 }
                },
            }
        )
    }
    const veiculoVan: IVehicle = {
        label: 'van-escolar', // nome do veiculo
        travelMode: 1, // modo de viajar, 1 significa carro
        startLocation: { latitude: 2349374, longitude: 958320958 }, // localização inicial do veiculo
        loadLimits: { // capacidade
            assentos: { maxLoad: motorista!.capacidade_van }
        },
        costPerKilometer: 2.5, // custo por kilometro, no caso aqui ta 2 reais e 50 centavos por kilometro
        costPerHour: 45.0 // custo por hora
    }

    const globalIDA = turnosValidos.reduce((menor, atual) => atual.hora_entrada < menor.hora_entrada ? atual : menor)
    const globalVOLTA = turnosValidos.reduce((menor, atual) => atual.hora_saida < menor.hora_saida ? atual : menor)

    const horaIda = timeToTimestamp(globalIDA.hora_entrada)
    const horaVolta = timeToTimestamp(globalVOLTA.hora_saida)

    // antes de criar a requisição, válida pra ver se as coisas necessarias tão no .env
    if(!process.env['GCP_PROJECT_ID'] || !process.env['GCP_CLIENT_EMAIL'] || !process.env['GCP_PRIVATE_KEY']) throw new Error('ABSENT_ENV_CONFIG')

    const requisicao: IOptimizeToursRequest = {
        parent: `projects/${process.env['GCP_PROJECT_ID']}`,
        searchMode: 1, // 1 pra retornar rapido, 2 pra procurar a melhor rota possivel. vou ver com o vitor a melhor abordagem depois.
        considerRoadTraffic: true, // considerar trafego da rua (pode ser impreciso ja que só vamos usar essa fucker uma vez por ser carissimo)
        populatePolylines: true, // devolver as polylines do mapa pra desenhar. vou ver com o vitor se é do agrado dele.
        populateTransitionPolylines: false, // devolver as polylines de cada trajeto invidual. exemplo: casa do aluno 1 pra casa do aluno 2
        // modelo da otimização de rota, ou seja, oq vai processar de fato
        model: {
            globalStartTime: rota.sentido === 'IDA' ? { seconds: horaIda.seconds - (2 * 60 * 60) } : { seconds: horaVolta.seconds - (10 * 60) }, // horario de inicio da rota, no caso começa 2h antes da escola com menor horario
            globalEndTime: rota.sentido === 'IDA' ? horaIda : { seconds: horaVolta.seconds + (2 * 60 * 60) }, // horario de termino da rota
            // lista das "mercadorias" ou seja, no nosso caso os alunos
            shipments: shipmentAlunos,
            // lista dos veiculos
            vehicles: [veiculoVan]
        }
    }
    const routeClient = new v1.RouteOptimizationClient({
        projectId: process.env['GCP_PROJECT_ID'],
        credentials: {
            client_email: process.env['GCP_CLIENT_EMAIL'],
            private_key: process.env["GCP_PRIVATE_KEY"].replace(/\\n/g, '\n'),
        },
    });
    const [response] = await routeClient.optimizeTours(requisicao)
    console.dir({ requisicao, turnosValidos }, { depth: null })
    return
}