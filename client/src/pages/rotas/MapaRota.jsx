import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LuLocateFixed, LuMinus, LuPlus } from 'react-icons/lu'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { obterPolylineRota } from '../../services/rotas'
import styles from './rota.module.css'

const CENTRO_INICIAL = [-23.6905, -46.7735]

const criarIconeParada = (ordem, ehEscola) => L.divIcon({
    className: 'marcador-parada-movan',
    html: `
        <div style="
            width: 30px;
            height: 30px;
            background: ${ehEscola ? '#0d47a1' : '#ffc33a'};
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            color: ${ehEscola ? '#ffffff' : '#1c2b45'};
            font-family: Poppins, sans-serif;
            font-size: 12px;
            font-weight: 700;
        ">
            ${ordem ?? '•'}
        </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
})

const iconeMotorista = L.divIcon({
    className: 'marcador-van-motorista',
    html: `
        <div style="
            width: 34px;
            height: 34px;
            background: #15720c;
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            color: #ffffff;
            font-family: Poppins, sans-serif;
            font-size: 11px;
            font-weight: 700;
        ">
            VAN
        </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
})

const decodePolyline = (encoded) => {
    if (!encoded) return []
    let index = 0
    const len = encoded.length
    let lat = 0
    let lng = 0
    const coords = []

    while (index < len) {
        let b
        let shift = 0
        let result = 0
        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)
        const dlat = (result & 1) ? ~(result >> 1) : (result >> 1)
        lat += dlat

        shift = 0
        result = 0
        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)
        const dlng = (result & 1) ? ~(result >> 1) : (result >> 1)
        lng += dlng

        coords.push([lat / 1e5, lng / 1e5])
    }

    return coords
}

const calcularDistanciaMetros = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3
    const rad = Math.PI / 180
    const dLat = (lat2 - lat1) * rad
    const dLon = (lon2 - lon1) * rad
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

const escaparHtml = (texto) => String(texto || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const MapaRota = ({ rotaId, pontos = [], alunos = [], escolas = [], versaoMapa = 0 }) => {
    const elementoMapa = useRef(null)
    const instanciaMapa = useRef(null)
    const marcadoresRef = useRef([])
    const marcadorMotoristaRef = useRef(null)
    const polylineRef = useRef(null)
    const polylineOriginalRef = useRef([])
    const posicaoMotoristaRef = useRef(null)

    const [posicaoMotorista, setPosicaoMotorista] = useState(null)

    const coordenadas = useMemo(() => (
        pontos
            .map((ponto) => {
                if (ponto.aluno_id) {
                    const aluno = alunos.find((a) => String(a.id) === String(ponto.aluno_id))
                    if (aluno?.latitude != null && aluno?.longitude != null) {
                        return {
                            lat: Number(aluno.latitude),
                            lng: Number(aluno.longitude),
                            nome: aluno.nome,
                            tipo: 'Aluno',
                            ehEscola: false,
                            tipoPonto: ponto.tipo_ponto,
                            ordem: ponto.ordem,
                        }
                    }
                }
                if (ponto.escola_id) {
                    const escola = escolas.find((e) => String(e.id) === String(ponto.escola_id))
                    if (escola?.latitude != null && escola?.longitude != null) {
                        return {
                            lat: Number(escola.latitude),
                            lng: Number(escola.longitude),
                            nome: escola.nome,
                            tipo: 'Escola',
                            ehEscola: true,
                            tipoPonto: ponto.tipo_ponto,
                            ordem: ponto.ordem,
                        }
                    }
                }
                return null
            })
            .filter((item) => item && Number.isFinite(item.lat) && Number.isFinite(item.lng))
    ), [pontos, alunos, escolas])

    // 1. Inicializar mapa Leaflet uma única vez
    useEffect(() => {
        const mapa = L.map(elementoMapa.current, {
            center: CENTRO_INICIAL,
            zoom: 13,
            zoomControl: false,
        })
        instanciaMapa.current = mapa

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapa)

        const resizeObserver = new ResizeObserver(() => mapa.invalidateSize({ pan: false }))
        resizeObserver.observe(elementoMapa.current)

        return () => {
            resizeObserver.disconnect()
            instanciaMapa.current = null
            mapa.remove()
        }
    }, [])

    // 2. Acompanhar localização do motorista sem recalcular a API de polyline a cada tick
    useEffect(() => {
        if (!navigator.geolocation) return undefined

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const novaPos = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                }
                posicaoMotoristaRef.current = novaPos
                setPosicaoMotorista(novaPos)
            },
            () => {
                // Permissão negada ou GPS indisponível: segue normalmente sem o marcador da van
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000,
            },
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    // 3. Atualiza visualmente o trecho restante da polyline já carregada
    const desenharPolyline = useCallback((posAtual) => {
        const mapa = instanciaMapa.current
        const coordsOriginais = polylineOriginalRef.current
        if (!mapa || coordsOriginais.length < 2) return

        let coordsRestantes = coordsOriginais

        if (posAtual) {
            let indiceMaisProximo = 0
            let menorDistancia = Infinity

            for (let i = 0; i < coordsOriginais.length; i++) {
                const [pLat, pLng] = coordsOriginais[i]
                const dist = calcularDistanciaMetros(posAtual.lat, posAtual.lng, pLat, pLng)
                if (dist < menorDistancia) {
                    menorDistancia = dist
                    indiceMaisProximo = i
                }
            }

            if (menorDistancia <= 75 && indiceMaisProximo > 0) {
                coordsRestantes = [
                    [posAtual.lat, posAtual.lng],
                    ...coordsOriginais.slice(indiceMaisProximo),
                ]
            }
        }

        if (polylineRef.current) {
            polylineRef.current.setLatLngs(coordsRestantes)
        } else {
            polylineRef.current = L.polyline(coordsRestantes, {
                color: '#0d47a1',
                weight: 4.5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(mapa)
        }
    }, [])

    // 4. Atualiza somente o marcador da van e o trecho percorrido quando o GPS muda
    useEffect(() => {
        const mapa = instanciaMapa.current
        if (!mapa || !posicaoMotorista) return

        if (marcadorMotoristaRef.current) {
            marcadorMotoristaRef.current.setLatLng([posicaoMotorista.lat, posicaoMotorista.lng])
        } else {
            const marcador = L.marker([posicaoMotorista.lat, posicaoMotorista.lng], {
                icon: iconeMotorista,
                zIndexOffset: 1000,
            }).addTo(mapa)
            marcador.bindTooltip('<strong>Sua van (posição atual)</strong>', { direction: 'top' })
            marcadorMotoristaRef.current = marcador
        }

        desenharPolyline(posicaoMotorista)
    }, [posicaoMotorista, desenharPolyline])

    // 5. Atualiza marcadores e busca a polyline no backend somente quando rota/pontos mudam
    useEffect(() => {
        const mapa = instanciaMapa.current
        if (!mapa) return undefined

        marcadoresRef.current.forEach((m) => mapa.removeLayer(m))
        marcadoresRef.current = []

        if (polylineRef.current) {
            mapa.removeLayer(polylineRef.current)
            polylineRef.current = null
        }
        polylineOriginalRef.current = []

        if (coordenadas.length === 0) {
            if (posicaoMotoristaRef.current) {
                mapa.setView([posicaoMotoristaRef.current.lat, posicaoMotoristaRef.current.lng], 14)
            } else {
                mapa.setView(CENTRO_INICIAL, 13)
            }
            return undefined
        }

        coordenadas.forEach(({ lat, lng, nome, tipo, ehEscola, tipoPonto, ordem }) => {
            const marcador = L.marker([lat, lng], {
                icon: criarIconeParada(ordem, ehEscola),
                alt: nome || 'Ponto da rota',
            }).addTo(mapa)

            const rotuloTipoPonto = tipoPonto === 'EMBARQUE' ? 'Embarque' : 'Desembarque'
            marcador.bindTooltip(
                `<strong>${ordem ? `${ordem}º - ` : ''}${escaparHtml(nome)}</strong><br/>${tipo} (${rotuloTipoPonto})`,
                { direction: 'top' },
            )
            marcadoresRef.current.push(marcador)
        })

        const controller = new AbortController()

        const carregarTrajeto = async () => {
            const posAtual = posicaoMotoristaRef.current
            const podePedirPolyline = rotaId && (coordenadas.length >= 2 || (coordenadas.length >= 1 && posAtual))

            if (podePedirPolyline) {
                const coordsParam = posAtual
                    ? { latitude: posAtual.lat, longitude: posAtual.lng }
                    : undefined

                const polylineCodificada = await obterPolylineRota(rotaId, coordsParam, controller.signal)
                if (controller.signal.aborted) return

                if (polylineCodificada) {
                    const coordsDecodificadas = decodePolyline(polylineCodificada)
                    if (coordsDecodificadas.length >= 2) {
                        polylineOriginalRef.current = coordsDecodificadas
                        desenharPolyline(posicaoMotoristaRef.current)
                        if (instanciaMapa.current) {
                            instanciaMapa.current.fitBounds(L.latLngBounds(coordsDecodificadas), {
                                padding: [36, 36],
                                maxZoom: 15,
                            })
                        }
                        return
                    }
                }
            }

            if (controller.signal.aborted) return

            // Fallback simples caso o backend não retorne polyline
            const pontosSimples = coordenadas.map(({ lat, lng }) => [lat, lng])
            if (pontosSimples.length >= 2) {
                polylineOriginalRef.current = pontosSimples
                desenharPolyline(posicaoMotoristaRef.current)
            }

            if (instanciaMapa.current && pontosSimples.length > 0) {
                instanciaMapa.current.fitBounds(L.latLngBounds(pontosSimples), {
                    padding: [36, 36],
                    maxZoom: 15,
                })
            }
        }

        carregarTrajeto()

        return () => controller.abort()
    }, [rotaId, coordenadas, versaoMapa, desenharPolyline])

    const centralizarMapa = () => {
        const mapa = instanciaMapa.current
        if (!mapa) return

        if (polylineRef.current) {
            mapa.fitBounds(polylineRef.current.getBounds(), { padding: [36, 36], maxZoom: 15 })
        } else if (coordenadas.length > 0) {
            mapa.fitBounds(L.latLngBounds(coordenadas.map(({ lat, lng }) => [lat, lng])), {
                padding: [36, 36],
                maxZoom: 15,
            })
        } else if (posicaoMotoristaRef.current) {
            mapa.setView([posicaoMotoristaRef.current.lat, posicaoMotoristaRef.current.lng], 15)
        } else {
            mapa.setView(CENTRO_INICIAL, 13)
        }
    }

    return (
        <>
            <div
                ref={elementoMapa}
                className={styles.mapaLeaflet}
                role="region"
                aria-label="Mapa da rota com paradas ordenadas"
            />
            <div className={styles.controlesMapa}>
                <button
                    type="button"
                    aria-label="Aproximar mapa"
                    onClick={() => instanciaMapa.current?.zoomIn()}
                >
                    <LuPlus aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label="Afastar mapa"
                    onClick={() => instanciaMapa.current?.zoomOut()}
                >
                    <LuMinus aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label="Centralizar rota no mapa"
                    onClick={centralizarMapa}
                >
                    <LuLocateFixed aria-hidden="true" />
                </button>
            </div>
        </>
    )
}

export default MapaRota
