import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { LuLocateFixed, LuMinus } from 'react-icons/lu'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import marcadorUrl from 'leaflet/dist/images/marker-icon.png'
import marcadorRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import sombraMarcadorUrl from 'leaflet/dist/images/marker-shadow.png'

import { obterPolylineRota } from '../../services/rotas'
import { carregarGooglePlaces } from '../../services/googlePlaces'
import styles from './rota.module.css'

const centroInicial = [-23.6905, -46.7735]

const iconePadrao = L.icon({
    iconUrl: marcadorUrl,
    iconRetinaUrl: marcadorRetinaUrl,
    shadowUrl: sombraMarcadorUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
})

// Ícone especial para a van / posição atual do motorista
const iconeMotorista = L.divIcon({
    className: 'marcador-van-motorista',
    html: `
        <div style="
            width: 34px;
            height: 34px;
            background: #0d47a1;
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            color: #ffffff;
            font-size: 17px;
        ">
            🚐
        </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
})

// Decodifica a polyline codificada do Google Routes
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

// Calcula a distância euclidiana aproximada em metros entre dois pontos
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

const MapaRota = ({ rotaId, pontos = [], alunos = [], escolas = [] }) => {
    const elementoMapa = useRef(null)
    const instanciaMapa = useRef(null)
    const marcadoresRef = useRef([])
    const marcadorMotoristaRef = useRef(null)
    const polylineRef = useRef(null)
    const polylineOriginalRef = useRef([])

    const [posicaoMotorista, setPosicaoMotorista] = useState(null)

    // construir coordenadas a partir dos pontos na ordem em que estão cadastrados
    const coordenadas = useMemo(() => {
        return pontos
            .map((ponto) => {
                if (ponto.aluno_id) {
                    const aluno = alunos.find((a) => String(a.id) === String(ponto.aluno_id))
                    if (aluno?.latitude != null && aluno?.longitude != null) {
                        return {
                            lat: Number(aluno.latitude),
                            lng: Number(aluno.longitude),
                            nome: aluno.nome,
                            tipo: 'Aluno',
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
                            tipoPonto: ponto.tipo_ponto,
                            ordem: ponto.ordem,
                        }
                    }
                }
                return null
            })
            .filter(Boolean)
    }, [pontos, alunos, escolas])

    // 1. Inicializar mapa Leaflet
    useEffect(() => {
        const mapa = L.map(elementoMapa.current, {
            center: centroInicial,
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

    // 2. Acompanhar localização em tempo real do motorista via Geolocation API
    useEffect(() => {
        if (!navigator.geolocation) return

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosicaoMotorista({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                })
            },
            () => {
                // Se o motorista não conceder permissão, não quebra
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
            }
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    // 3. Atualizar traçado e consumir/apagar trecho por onde o motorista já passou
    const atualizarLinhaRestante = useCallback((posAtual) => {
        const mapa = instanciaMapa.current
        const coordsOriginais = polylineOriginalRef.current
        if (!mapa || coordsOriginais.length < 2) return

        let coordsRestantes = coordsOriginais

        if (posAtual) {
            // Encontra o ponto da polyline mais próximo da localização atual
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

            // Se o motorista está a menos de 75m da rota, "apaga" os pontos anteriores
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
            const linha = L.polyline(coordsRestantes, {
                color: '#0d47a1',
                weight: 4.5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(mapa)
            polylineRef.current = linha
        }
    }, [])

    // 4. Atualizar o marcador da van do motorista no mapa
    useEffect(() => {
        const mapa = instanciaMapa.current
        if (!mapa) return

        if (posicaoMotorista) {
            if (marcadorMotoristaRef.current) {
                marcadorMotoristaRef.current.setLatLng([posicaoMotorista.lat, posicaoMotorista.lng])
            } else {
                const marcador = L.marker([posicaoMotorista.lat, posicaoMotorista.lng], {
                    icon: iconeMotorista,
                    zIndexOffset: 1000,
                }).addTo(mapa)
                marcador.bindTooltip('<strong>Sua van (Localização atual)</strong>', { direction: 'top' })
                marcadorMotoristaRef.current = marcador
            }

            // Atualiza o traçado da rota apagando por onde já passou
            atualizarLinhaRestante(posicaoMotorista)
        }
    }, [posicaoMotorista, atualizarLinhaRestante])

    // 5. Carregar trajeto pelas ruas iniciando no local atual do motorista
    useEffect(() => {
        const mapa = instanciaMapa.current
        if (!mapa) return

        // Limpar marcadores anteriores
        marcadoresRef.current.forEach((m) => mapa.removeLayer(m))
        marcadoresRef.current = []

        if (polylineRef.current) {
            mapa.removeLayer(polylineRef.current)
            polylineRef.current = null
        }
        polylineOriginalRef.current = []

        if (coordenadas.length === 0) {
            if (posicaoMotorista) {
                mapa.setView([posicaoMotorista.lat, posicaoMotorista.lng], 14)
            } else {
                mapa.setView(centroInicial, 13)
            }
            return
        }

        // Adicionar marcadores dos alunos e escolas
        coordenadas.forEach(({ lat, lng, nome, tipo, tipoPonto, ordem }) => {
            const marcador = L.marker([lat, lng], {
                icon: iconePadrao,
                alt: nome || 'Ponto da rota',
            }).addTo(mapa)

            const rotuloTipoPonto = tipoPonto === 'EMBARQUE' ? 'Embarque' : 'Desembarque'
            marcador.bindTooltip(
                `<strong>${ordem ? `${ordem}º - ` : ''}${nome}</strong><br/>${tipo} (${rotuloTipoPonto})`,
                { direction: 'top' }
            )
            marcadoresRef.current.push(marcador)
        })

        let ativo = true

        const tracarRota = async () => {
            // Se temos a posição do motorista, a rota começa nela!
            // Ex: [Motorista] -> [Ponto 1] -> [Ponto 2] -> ... -> [Destino final]
            const pontosComOrigem = posicaoMotorista
                ? [{ lat: posicaoMotorista.lat, lng: posicaoMotorista.lng }, ...coordenadas]
                : coordenadas

            // Tenta usar a Google Directions API pelo cliente com a chave VITE_GOOGLE_MAPS_API_KEY
            if (pontosComOrigem.length >= 2) {
                try {
                    const googleMaps = await carregarGooglePlaces()
                    const directionsService = new googleMaps.DirectionsService()

                    const origem = { lat: pontosComOrigem[0].lat, lng: pontosComOrigem[0].lng }
                    const destino = {
                        lat: pontosComOrigem[pontosComOrigem.length - 1].lat,
                        lng: pontosComOrigem[pontosComOrigem.length - 1].lng,
                    }
                    const waypoints = pontosComOrigem.slice(1, -1).map((p) => ({
                        location: { lat: p.lat, lng: p.lng },
                        stopover: true,
                    }))

                    const resultado = await new Promise((resolve, reject) => {
                        directionsService.route(
                            {
                                origin: origem,
                                destination: destino,
                                waypoints,
                                travelMode: googleMaps.TravelMode.DRIVING,
                            },
                            (res, status) => {
                                if (status === 'OK' && res) resolve(res)
                                else reject(new Error(status))
                            }
                        )
                    })

                    if (ativo && resultado?.routes?.[0]?.overview_path) {
                        const coordsGoogle = resultado.routes[0].overview_path.map((pt) => [pt.lat(), pt.lng()])
                        polylineOriginalRef.current = coordsGoogle
                        atualizarLinhaRestante(posicaoMotorista)

                        if (instanciaMapa.current) {
                            const bounds = L.latLngBounds(coordsGoogle)
                            instanciaMapa.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
                        }
                        return
                    }
                } catch {
                    // Google Directions no front falhou ou indisponível, segue para backend
                }
            }

            // Fallback 1: polyline codificada do backend (passando coordenadas do motorista se disponíveis)
            if (rotaId) {
                const coordenadasParam = posicaoMotorista
                    ? { latitude: posicaoMotorista.lat, longitude: posicaoMotorista.lng }
                    : undefined

                const polylineCodificada = await obterPolylineRota(rotaId, coordenadasParam)
                if (ativo && polylineCodificada) {
                    const coordsDecodificadas = decodePolyline(polylineCodificada)
                    if (coordsDecodificadas.length > 0) {
                        polylineOriginalRef.current = coordsDecodificadas
                        atualizarLinhaRestante(posicaoMotorista)

                        if (instanciaMapa.current) {
                            const bounds = L.latLngBounds(coordsDecodificadas)
                            instanciaMapa.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
                        }
                        return
                    }
                }
            }

            // Fallback 2: traçado simples ligando a van e os pontos
            if (pontosComOrigem.length > 1) {
                const coordsSimples = pontosComOrigem.map(({ lat, lng }) => [lat, lng])
                polylineOriginalRef.current = coordsSimples
                atualizarLinhaRestante(posicaoMotorista)
            }

            if (instanciaMapa.current) {
                const todosPontos = pontosComOrigem.map(({ lat, lng }) => [lat, lng])
                const bounds = L.latLngBounds(todosPontos)
                instanciaMapa.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 })
            }
        }

        tracarRota()

        return () => {
            ativo = false
        }
    }, [rotaId, coordenadas, posicaoMotorista, atualizarLinhaRestante])

    return (
        <>
            <div
                ref={elementoMapa}
                className={styles.mapaLeaflet}
                role="region"
                aria-label="Mapa da rota com acompanhamento em tempo real"
            />
            <div className={styles.controlesMapa}>
                <button
                    type="button"
                    aria-label="Centralizar na sua van ou rota"
                    onClick={() => {
                        const mapa = instanciaMapa.current
                        if (!mapa) return

                        if (posicaoMotorista) {
                            mapa.setView([posicaoMotorista.lat, posicaoMotorista.lng], 15)
                        } else if (polylineRef.current) {
                            mapa.fitBounds(polylineRef.current.getBounds(), { padding: [35, 35], maxZoom: 15 })
                        } else if (coordenadas.length > 0) {
                            const bounds = L.latLngBounds(coordenadas.map(({ lat, lng }) => [lat, lng]))
                            mapa.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 })
                        } else {
                            mapa.setView(centroInicial, 13)
                        }
                    }}
                >
                    <LuLocateFixed aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label="Afastar mapa"
                    onClick={() => instanciaMapa.current?.zoomOut()}
                >
                    <LuMinus aria-hidden="true" />
                </button>
            </div>
        </>
    )
}

export default MapaRota
