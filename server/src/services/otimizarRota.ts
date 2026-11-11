import { v1, protos } from '@googlemaps/routeoptimization'
import { GoogleAuth } from 'google-auth-library';
import { Rota } from '../models/rotas/rota.js';
import { PontoRota } from '../models/rotas/pontoRota.js';
import { Aluno } from '../models/aluno.model.js';
import { Escola } from '../models/escola/escola.model.js';
import { EscolaTurno } from '../models/escola/turno.model.js';
import { Request } from 'express';
import { timeToTimestamp } from '../utils/converterTimestamp.js';
import { Motorista } from '../models/motorista/motorista.model.js';
import { validarCoordenadas } from '../models/utils.model.js';
import { PoolClient } from 'pg';

// importação dos tipos
type IOptimizeToursRequest = protos.google.maps.routeoptimization.v1.IOptimizeToursRequest;
type IShipment = protos.google.maps.routeoptimization.v1.IShipment;
type IVehicle = protos.google.maps.routeoptimization.v1.IVehicle;

interface coordenadasMotorista {
    latitude: number,
    longitude: number
}

interface otimizarRotaProps {
    rotaID: number,
    req: Request,
    coordenadasMotorista: coordenadasMotorista,
    cliente: PoolClient
}

const auth = new GoogleAuth({
    projectId: process.env['GCP_PROJECT_ID'] ?? '',
    credentials: {
        client_email: process.env['GCP_CLIENT_EMAIL'] ?? '',
        private_key: (process.env['GCP_PRIVATE_KEY'] ?? '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const routeClient = new v1.RouteOptimizationClient({
    auth: auth as unknown as v1.RouteOptimizationClient['auth']
});

// função
export const otimizarRota = async ({ rotaID, req, coordenadasMotorista, cliente }: otimizarRotaProps): Promise<void> => {
    // valida se as coordenadas são válidas
    const coordenadasValidas = validarCoordenadas.safeParse(coordenadasMotorista)

    if (!coordenadasValidas.success) {
        throw new Error('DRIVER_COORDINATES_INVALID', { cause: coordenadasValidas.error })
    }

    // primeiro pego os dados necessarios.
    const motoristaID = req.userId
    const { rows: [motorista] } = await cliente.query<Motorista>(
        `
        SELECT * FROM motorista
        WHERE id = $1
        `,
        [motoristaID]
    )
    if (!motorista) {
        throw new Error('MOTORISTA_NOT_FOUND')
    }
    // pegando as infos da rota
    const { rows: [rota] } = await cliente.query<Rota>(
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
    const { rows: pontosRota } = await cliente.query<PontoRota>(
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
    const { rows: alunos } = await cliente.query<Aluno>(
        "SELECT * FROM aluno WHERE motorista_id = $1",
        [motoristaID]
    )
    if (alunos.length < 1) {
        throw new Error('ALUNO_NOT_FOUND')
    }
    // agora pega os dados da escola.
    const { rows: escolas } = await cliente.query<Escola>(
        "SELECT * FROM escola WHERE motorista_id = $1",
        [motoristaID]
    )
    if (escolas.length < 1) {
        throw new Error('ESCOLA_NOT_FOUND')
    }
    // agora pega os dados do turno daquela escola.
    const escolasIDs = escolas.map(e => e.id)
    const { rows: turnosEscolas } = await cliente.query<EscolaTurno>(
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

    if (pontosRotaFiltrados.length === 0) {
        throw new Error('PONTOS_SENTIDO_NOT_FOUND')
    }

    for (const pontoRota of pontosRotaFiltrados) {
        // filtrando pra obter somente os dados que preciso.
        const aluno = alunos.find(a => a.id === pontoRota.aluno_id)
        if (!aluno) {
            throw new Error('ALUNO_NOT_FOUND')
        }
        const escola = escolas.find(e => e.id === aluno.escola_id)
        if (!escola) {
            throw new Error('ESCOLA_NOT_FOUND')
        }
        const turno = turnosEscolas.find(t => t.id === aluno.escola_turno_id)
        if (!turno) {
            throw new Error('TURNO_NOT_FOUND')
        }

        // validando coordenadas do aluno e da escola com zod
        const coordenadasAluno = validarCoordenadas.safeParse({
            latitude: aluno.latitude !== null ? Number(aluno.latitude) : null,
            longitude: aluno.longitude !== null ? Number(aluno.longitude) : null
        })
        if (!coordenadasAluno.success) {
            throw new Error('ALUNO_COORDINATES_INVALID', { cause: coordenadasAluno.error })
        }

        const coordenadasEscola = validarCoordenadas.safeParse({
            latitude: escola.latitude !== null ? Number(escola.latitude) : null,
            longitude: escola.longitude !== null ? Number(escola.longitude) : null
        })
        if (!coordenadasEscola.success) {
            throw new Error('ESCOLA_COORDINATES_INVALID', { cause: coordenadasEscola.error })
        }

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
                penaltyCost: 100000,
                pickups: [
                    {
                        label: rota.sentido === 'IDA' ? `casa_aluno_${aluno.id}` : `escola_${escola.id}`,
                        arrivalLocation: {
                            latitude: rota.sentido === 'IDA' ? coordenadasAluno.data.latitude : coordenadasEscola.data.latitude,
                            longitude: rota.sentido === 'IDA' ? coordenadasAluno.data.longitude : coordenadasEscola.data.longitude
                        },
                        duration: { seconds: rota.sentido === 'IDA' ? 60 : 15 },
                        ...(rota.sentido === 'VOLTA' ? {
                            timeWindows: [
                                {
                                    startTime: horaSaida,
                                    endTime: {
                                        ...horaSaida,
                                        seconds: horaSaida.seconds + (30 * 60) // na volta, a janela pro motorista pegar o aluno na escola começa no horario de saida e vai até 30 minutos depois
                                    }
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
                            latitude: rota.sentido === 'IDA' ? coordenadasEscola.data.latitude : coordenadasAluno.data.latitude,
                            longitude: rota.sentido === 'IDA' ? coordenadasEscola.data.longitude : coordenadasAluno.data.longitude
                        },
                        duration: { seconds: rota.sentido === 'IDA' ? 15 : 60 },
                        ...(rota.sentido === 'IDA' ? {
                            timeWindows: [
                                {
                                    startTime: {
                                        ...horaEntrada,
                                        seconds: horaEntrada.seconds - (30 * 60) // na ida, a janela pro motorista deixar o aluno na escola começa 30 minutos antes da entrada e termina no horario de entrada
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
        startLocation: { latitude: coordenadasValidas.data.latitude, longitude: coordenadasValidas.data.longitude }, // localização inicial do veiculo
        loadLimits: { // capacidade
            assentos: { maxLoad: motorista.capacidade_van }
        },
        costPerKilometer: 2.5, // custo por kilometro, no caso aqui ta 2 reais e 50 centavos por kilometro
        costPerHour: 45.0 // custo por hora
    }

    const globalIDAinicio = timeToTimestamp(turnosValidos.reduce((menor, atual) => atual.hora_entrada < menor.hora_entrada ? atual : menor).hora_entrada) // escola com menor tempo de inicio
    const globalIDAfim = timeToTimestamp(turnosValidos.reduce((menor, atual) => atual.hora_entrada > menor.hora_entrada ? atual : menor).hora_entrada)  // escola com maior tempo de inicio
    const globalVOLTAinicio = timeToTimestamp(turnosValidos.reduce((menor, atual) => atual.hora_saida < menor.hora_saida ? atual : menor).hora_saida) // escola com menor tempo de fim
    const globalVOLTAfim = timeToTimestamp(turnosValidos.reduce((menor, atual) => atual.hora_saida > menor.hora_saida ? atual : menor).hora_saida) // escola com maior tempo de fim

    // antes de criar a requisição, válida pra ver se as coisas necessarias tão no .env
    if (!process.env['GCP_PROJECT_ID'] || !process.env['GCP_CLIENT_EMAIL'] || !process.env['GCP_PRIVATE_KEY']) throw new Error('ABSENT_ENV_CONFIG')

    const requisicao: IOptimizeToursRequest = {
        parent: `projects/${process.env['GCP_PROJECT_ID']}`,
        searchMode: 1, // 1 pra retornar rapido, 2 pra procurar a melhor rota possivel. vou ver com o vitor a melhor abordagem depois.
        considerRoadTraffic: true, // considerar trafego da rua (pode ser impreciso ja que só vamos usar essa fucker uma vez por ser carissimo)
        populatePolylines: true, // devolver as polylines do mapa pra desenhar. vou ver com o vitor se é do agrado dele.
        populateTransitionPolylines: false, // devolver as polylines de cada trajeto invidual. exemplo: casa do aluno 1 pra casa do aluno 2
        // modelo da otimização de rota, ou seja, oq vai processar de fato
        model: {
            globalStartTime: rota.sentido === 'IDA' ? { seconds: globalIDAinicio.seconds - (2 * 60 * 60) } : { seconds: globalVOLTAinicio.seconds - (30 * 60) }, // horario de inicio da rota, no caso começa 2h antes da escola com maior horario e se for uma rota de volta, pega a escola com menor tempo de saida menos 30 minutos
            globalEndTime: rota.sentido === 'IDA' ? globalIDAfim : { seconds: globalVOLTAfim.seconds + (2 * 60 * 60) }, // horario de termino da rota na ida é a escola com maior tempo de entrada e na volta é a escola com maior tempo de saida mais duas horas
            // lista das "mercadorias" ou seja, no nosso caso os alunos
            shipments: shipmentAlunos,
            // lista dos veiculos
            vehicles: [veiculoVan]
        }
    }
    const [response] = await routeClient.optimizeTours(requisicao)

    const rotaOtimizada = response.routes![0]

    if (!rotaOtimizada || !rotaOtimizada.visits) {
        throw new Error('UNKOWN_ERROR')
    }

    const ordemOtimizada = rotaOtimizada.visits
    const pontosRotaOtimizados: PontoRota[] = []

    // for pra transformar o que o google devolve de volta nos objetos originais de ponto_rota na ordem certa
    for (const visita of ordemOtimizada) {
        const label = visita.visitLabel
        if (!label) continue

        // verificando se a visita atual é na casa de um aluno ou em uma escola pelo label que definimos lá em cima
        const ehAluno = label.startsWith('casa_aluno_')
        const id = Number(ehAluno ? label.replace('casa_aluno_', '') : label.replace('escola_', ''))

        // buscando o ponto rota original correspondente
        const pontoOriginal = pontosRota.find(p => ehAluno ? p.aluno_id === id : p.escola_id === id)
        if (!pontoOriginal) continue

        // como vários alunos podem ser da mesma escola, o google devolve uma visita na escola pra cada aluno.
        // esse if garante que a escola não seja adicionada repetida no array final
        if (!pontosRotaOtimizados.some(p => p.id === pontoOriginal.id)) {
            pontosRotaOtimizados.push({
                ...pontoOriginal,
                ordem: pontosRotaOtimizados.length + 1
            })
        }
    }

    // agr coloco a nova ordem no banco de dados.
    for (const pontoRotaOtimizado of pontosRotaOtimizados) {
        await cliente.query(
            `
            UPDATE ponto_rota
            SET ordem = $1
            WHERE id = $2
            `,
            [pontoRotaOtimizado.ordem, pontoRotaOtimizado.id]
        )
    }
    return
}