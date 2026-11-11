import { useEffect, useId, useRef, useState } from 'react'
import { PiClockBold } from 'react-icons/pi'
import { horarioValido, mascararHorario, valorNoRelogio } from './relogio-horario'
import styles from './CampoHorario.module.css'

const doisDigitos = (valor) => String(valor).padStart(2, '0')

const CampoHorario = ({ label, value = '', onChange, required, disabled, alinharFim = false }) => {
    const id = useId()
    const campoRef = useRef(null)
    const botaoRef = useRef(null)
    const relogioRef = useRef(null)
    const popupRef = useRef(null)
    const arrastando = useRef(false)
    const [aberto, setAberto] = useState(false)
    const [etapa, setEtapa] = useState('hora')
    const [selecao, setSelecao] = useState({ hora: 0, minuto: 0 })

    useEffect(() => {
        if (!aberto) return undefined

        relogioRef.current?.focus({ preventScroll: true })
        popupRef.current?.scrollIntoView({ block: 'nearest' })

        const fecharFora = (event) => {
            if (!campoRef.current?.contains(event.target)) setAberto(false)
        }
        document.addEventListener('pointerdown', fecharFora)
        return () => document.removeEventListener('pointerdown', fecharFora)
    }, [aberto])

    const abrir = () => {
        if (aberto) {
            setAberto(false)
            return
        }

        const [hora, minuto] = horarioValido(value) ? value.split(':').map(Number) : [0, 0]
        setSelecao({ hora, minuto })
        setEtapa('hora')
        setAberto(true)
    }

    const fechar = () => {
        setAberto(false)
        botaoRef.current?.focus()
    }

    const confirmar = () => {
        onChange(`${doisDigitos(selecao.hora)}:${doisDigitos(selecao.minuto)}`)
        fechar()
    }

    const selecionarPeloPonteiro = (event) => {
        const caixa = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - caixa.left) / caixa.width - .5
        const y = (event.clientY - caixa.top) / caixa.height - .5
        if (Math.hypot(x, y) < .08) return
        setSelecao((atual) => ({ ...atual, [etapa]: valorNoRelogio(x, y, etapa) }))
    }

    const navegarRelogio = (event) => {
        const limite = etapa === 'hora' ? 24 : 60
        const passos = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }
        if (event.key in passos) {
            event.preventDefault()
            setSelecao((atual) => ({ ...atual, [etapa]: (atual[etapa] + passos[event.key] + limite) % limite }))
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            setSelecao((atual) => ({ ...atual, [etapa]: event.key === 'Home' ? 0 : limite - 1 }))
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (etapa === 'hora') setEtapa('minuto')
            else confirmar()
        }
    }

    const numeros = etapa === 'hora'
        ? Array.from({ length: 24 }, (_, indice) => indice)
        : Array.from({ length: 12 }, (_, indice) => indice * 5)
    const valorSelecionado = selecao[etapa]
    const angulo = valorSelecionado * (etapa === 'hora' ? 30 : 6)
    const raio = etapa === 'hora' && (valorSelecionado === 0 || valorSelecionado > 12) ? 27 : 41

    return (
        <div
            ref={campoRef}
            className={`${styles.campo} ${aberto ? styles.aberto : ''}`}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setAberto(false)
            }}
            onKeyDown={(event) => {
                if (aberto && event.key === 'Escape') {
                    event.preventDefault()
                    event.stopPropagation()
                    fechar()
                }
            }}
        >
            <label htmlFor={id}>{label}</label>
            <div className={styles.inputWrapper}>
                <button
                    ref={botaoRef}
                    type="button"
                    className={styles.botaoRelogio}
                    onClick={abrir}
                    aria-label={`Selecionar horário de ${label.toLocaleLowerCase('pt-BR')}`}
                    aria-haspopup="dialog"
                    aria-expanded={aberto}
                    aria-controls={aberto ? `${id}-relogio` : undefined}
                    disabled={disabled}
                >
                    <PiClockBold aria-hidden="true" />
                </button>
                <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    placeholder="HH:MM"
                    value={value}
                    onChange={(event) => onChange(mascararHorario(event.target.value))}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowDown' && !aberto) {
                            event.preventDefault()
                            abrir()
                        }
                    }}
                    pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                    title="Informe um horário entre 00:00 e 23:59."
                    maxLength={5}
                    required={required}
                    disabled={disabled}
                    autoComplete="off"
                />
            </div>
            {aberto && (
                <div
                    ref={popupRef}
                    id={`${id}-relogio`}
                    className={`${styles.popup} ${alinharFim ? styles.alinharFim : ''}`}
                    role="dialog"
                    aria-label={`Horário de ${label.toLocaleLowerCase('pt-BR')}`}
                >
                    <span className={styles.titulo}>Horário de {label.toLocaleLowerCase('pt-BR')}</span>
                    <div className={styles.horarioDigital}>
                        <button type="button" className={etapa === 'hora' ? styles.etapaAtiva : ''} onClick={() => setEtapa('hora')} aria-label="Escolher horas" aria-pressed={etapa === 'hora'}>
                            {doisDigitos(selecao.hora)}
                        </button>
                        <span aria-hidden="true">:</span>
                        <button type="button" className={etapa === 'minuto' ? styles.etapaAtiva : ''} onClick={() => setEtapa('minuto')} aria-label="Escolher minutos" aria-pressed={etapa === 'minuto'}>
                            {doisDigitos(selecao.minuto)}
                        </button>
                    </div>
                    <span className={styles.instrucao}>Escolha {etapa === 'hora' ? 'as horas' : 'os minutos'}</span>
                    <div
                        ref={relogioRef}
                        className={styles.relogio}
                        role="slider"
                        tabIndex={0}
                        aria-label={etapa === 'hora' ? 'Horas' : 'Minutos'}
                        aria-valuemin={0}
                        aria-valuemax={etapa === 'hora' ? 23 : 59}
                        aria-valuenow={valorSelecionado}
                        aria-valuetext={`${doisDigitos(valorSelecionado)} ${etapa === 'hora' ? 'horas' : 'minutos'}`}
                        onKeyDown={navegarRelogio}
                        onPointerDown={(event) => {
                            if (event.button !== 0) return
                            event.preventDefault()
                            event.currentTarget.focus({ preventScroll: true })
                            event.currentTarget.setPointerCapture(event.pointerId)
                            arrastando.current = true
                            selecionarPeloPonteiro(event)
                        }}
                        onPointerMove={(event) => {
                            if (arrastando.current) selecionarPeloPonteiro(event)
                        }}
                        onPointerUp={(event) => {
                            if (!arrastando.current) return
                            selecionarPeloPonteiro(event)
                            arrastando.current = false
                            if (etapa === 'hora') setEtapa('minuto')
                        }}
                        onPointerCancel={() => { arrastando.current = false }}
                        onLostPointerCapture={() => { arrastando.current = false }}
                    >
                        <span className={styles.ponteiro} style={{ height: `${raio}%`, transform: `translateX(-50%) rotate(${angulo}deg)` }} aria-hidden="true" />
                        <span className={styles.centro} aria-hidden="true" />
                        {numeros.map((numero) => {
                            const interno = etapa === 'hora' && (numero === 0 || numero > 12)
                            const distancia = interno ? 27 : 41
                            const radianos = numero * (etapa === 'hora' ? 30 : 6) * Math.PI / 180
                            return (
                                <span
                                    key={numero}
                                    className={`${styles.numero} ${interno ? styles.numeroInterno : ''} ${numero === valorSelecionado ? styles.numeroSelecionado : ''}`}
                                    style={{ left: `${50 + Math.sin(radianos) * distancia}%`, top: `${50 - Math.cos(radianos) * distancia}%` }}
                                    aria-hidden="true"
                                >
                                    {doisDigitos(numero)}
                                </span>
                            )
                        })}
                    </div>
                    <div className={styles.acoes}>
                        <button type="button" className={styles.cancelar} onClick={fechar}>Cancelar</button>
                        <button type="button" className={styles.confirmar} onClick={confirmar}>Confirmar</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CampoHorario
