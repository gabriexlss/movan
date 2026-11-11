import { useEffect, useRef } from 'react'
import { LuLocateFixed, LuMinus } from 'react-icons/lu'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import marcadorUrl from 'leaflet/dist/images/marker-icon.png'
import marcadorRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import sombraMarcadorUrl from 'leaflet/dist/images/marker-shadow.png'

import styles from './rota.module.css'

const centroInicial = [-23.6905, -46.7735]

const destinoExemplo = [-23.6975, -46.7712]

const MapaRota = () => {
    const elementoMapa = useRef(null)
    const instanciaMapa = useRef(null)

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

        L.marker(destinoExemplo, {
            alt: 'Destino de exemplo',
            icon: L.icon({
                iconUrl: marcadorUrl,
                iconRetinaUrl: marcadorRetinaUrl,
                shadowUrl: sombraMarcadorUrl,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                shadowSize: [41, 41],
            }),
            interactive: false,
            keyboard: false,
        }).addTo(mapa)

        const resizeObserver = new ResizeObserver(() => mapa.invalidateSize({ pan: false }))
        resizeObserver.observe(elementoMapa.current)

        return () => {
            resizeObserver.disconnect()
            instanciaMapa.current = null
            mapa.remove()
        }
    }, [])

    return (
        <>
            <div
                ref={elementoMapa}
                className={styles.mapaLeaflet}
                role="region"
                aria-label="Mapa do Jardim Ângela com um destino de exemplo"
            />
            <div className={styles.controlesMapa}>
                <button
                    type="button"
                    aria-label="Centralizar mapa"
                    onClick={() => instanciaMapa.current?.setView(centroInicial, 13)}
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
