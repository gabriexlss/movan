import { GoogleAuth } from 'google-auth-library';
import { Rota } from '../models/rotas/rota.js';
import { PontoRota } from '../models/rotas/pontoRota.js';
import { Aluno } from '../models/aluno.model.js';
import { Escola } from '../models/escola/escola.model.js';
import { validarCoordenadas } from '../models/utils.model.js';
import { PoolClient } from 'pg';

interface coordenadasMotorista {
    latitude: number,
    longitude: number
}

interface gerarPolylineRotaProps {
    rotaID: number,
    motoristaID: number,
    coordenadasMotorista?: coordenadasMotorista,
    cliente: PoolClient
}

interface RoutesWaypoint {
    location: {
        latLng: {
            latitude: number,
            longitude: number
        }
    }
}

interface ComputeRoutesResponse {
    routes?: {
        polyline?: {
            encodedPolyline?: string
        }
    }[]
}

const auth = new GoogleAuth({
    projectId: process.env['GCP_PROJECT_ID'] ?? '',
    credentials: {
        client_email: process.env['GCP_CLIENT_EMAIL'] ?? '',
        private_key: (process.env['GCP_PRIVATE_KEY'] ?? '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// função que gera a polyline usando a Google Routes API v2 
export const gerarPolylineRota = async ({ rotaID, motoristaID, coordenadasMotorista, cliente }: gerarPolylineRotaProps): Promise<string> => {
    let coordenadasIniciais: coordenadasMotorista | undefined

    if (coordenadasMotorista !== undefined) {
        const coordenadasValidas = validarCoordenadas.safeParse(coordenadasMotorista)
        if (!coordenadasValidas.success) {
            throw new Error('DRIVER_COORDINATES_INVALID', { cause: coordenadasValidas.error })
        }
        coordenadasIniciais = coordenadasValidas.data
    }

    // verifica se a rota existe e pertence ao motorista
    const { rows: [rota] } = await cliente.query<Rota>(
        `
        SELECT * FROM rota
        WHERE id = $1 AND motorista_id = $2
        `,
        [rotaID, motoristaID]
    )
    if (!rota) {
        throw new Error('ROTA_NOT_FOUND')
    }

    // busca todos os pontos da rota já ordenados pela coluna ordem ASC
    const { rows: pontosRota } = await cliente.query<PontoRota>(
        `
        SELECT * FROM ponto_rota
        WHERE rota_id = $1 AND motorista_id = $2
        ORDER BY ordem ASC
        `,
        [rotaID, motoristaID]
    )
    if (pontosRota.length < 1) {
        throw new Error('PONTOS_NOT_FOUND')
    }

    const { rows: alunos } = await cliente.query<Aluno>(
        "SELECT * FROM aluno WHERE motorista_id = $1",
        [motoristaID]
    )
    const { rows: escolas } = await cliente.query<Escola>(
        "SELECT * FROM escola WHERE motorista_id = $1",
        [motoristaID]
    )

    const waypoints: RoutesWaypoint[] = []

    // se as coordenadas do motorista foram enviadas, a rota começa na localização dele
    if (coordenadasIniciais) {
        waypoints.push({
            location: {
                latLng: {
                    latitude: coordenadasIniciais.latitude,
                    longitude: coordenadasIniciais.longitude
                }
            }
        })
    }

    // adiciona cada ponto_rota exatamente na ordem em que estão no banco
    for (const ponto of pontosRota) {
        if (ponto.aluno_id) {
            const aluno = alunos.find(a => a.id === ponto.aluno_id)
            if (!aluno) {
                throw new Error('ALUNO_NOT_FOUND')
            }

            const coordenadasAluno = validarCoordenadas.safeParse({
                latitude: aluno.latitude !== null ? Number(aluno.latitude) : null,
                longitude: aluno.longitude !== null ? Number(aluno.longitude) : null
            })
            if (!coordenadasAluno.success) {
                throw new Error('ALUNO_COORDINATES_INVALID', { cause: coordenadasAluno.error })
            }

            waypoints.push({
                location: {
                    latLng: {
                        latitude: coordenadasAluno.data.latitude,
                        longitude: coordenadasAluno.data.longitude
                    }
                }
            })
        } else if (ponto.escola_id) {
            const escola = escolas.find(e => e.id === ponto.escola_id)
            if (!escola) {
                throw new Error('ESCOLA_NOT_FOUND')
            }

            const coordenadasEscola = validarCoordenadas.safeParse({
                latitude: escola.latitude !== null ? Number(escola.latitude) : null,
                longitude: escola.longitude !== null ? Number(escola.longitude) : null
            })
            if (!coordenadasEscola.success) {
                throw new Error('ESCOLA_COORDINATES_INVALID', { cause: coordenadasEscola.error })
            }

            waypoints.push({
                location: {
                    latLng: {
                        latitude: coordenadasEscola.data.latitude,
                        longitude: coordenadasEscola.data.longitude
                    }
                }
            })
        }
    }

    if (waypoints.length < 2) {
        throw new Error('PONTOS_NOT_FOUND')
    }

    if (!process.env['GCP_PROJECT_ID'] || !process.env['GCP_CLIENT_EMAIL'] || !process.env['GCP_PRIVATE_KEY']) {
        throw new Error('ABSENT_ENV_CONFIG')
    }

    const origem = waypoints[0]!
    const destino = waypoints[waypoints.length - 1]!
    const intermediarios = waypoints.slice(1, -1)

    const authClient = await auth.getClient()
    const resposta = await authClient.request<ComputeRoutesResponse>({
        url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
            'X-Goog-User-Project': process.env['GCP_PROJECT_ID']
        },
        data: {
            origin: origem,
            destination: destino,
            ...(intermediarios.length > 0 ? { intermediates: intermediarios } : {}),
            travelMode: 'DRIVE',
            optimizeWaypointOrder: false
        }
    })

    const polyline = resposta.data.routes?.[0]?.polyline?.encodedPolyline

    if (!polyline) {
        throw new Error('UNKOWN_ERROR')
    }

    return polyline
}
