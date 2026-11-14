import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LuPencil, LuPlus, LuTrash2, LuUserRound } from 'react-icons/lu'
import { TbSunFilled, TbSunset2Filled } from 'react-icons/tb'
import { IoMoon } from 'react-icons/io5'
import { RiGraduationCapLine } from 'react-icons/ri'

import TituloTela from '../../components/layout/tituloTela'
import MapaRota from './MapaRota'
import DialogPontoRota from './DialogPontoRota'
import styles from './rota.module.css'

const turnos = [
    { id: 'manha', nome: 'Manhã', icone: TbSunFilled, cor: '#F4C51F' },
    { id: 'tarde', nome: 'Tarde', icone: TbSunset2Filled, cor: '#e7a01c' },
    { id: 'noite', nome: 'Noite', icone: IoMoon, cor: '#a6e7f3' },
]

const escolas = [
    {
        nome: 'Etec Jd. Ângela',
        endereco: 'Estr. da Baronesa, 1695',
        bairro: 'Jardim Nakamura',
        distancia: '2,3 km',
        horarios: { manha: '06:30', tarde: '12:30', noite: '18:30' },
    },
    {
        nome: 'E.M.E.F. Prof. Clemente Pastore',
        endereco: 'R. Antônio Ferreira de Almeida, 210',
        bairro: 'Jardim São Luís',
        distancia: '3,7 km',
        horarios: { manha: '06:45', tarde: '12:45', noite: '18:45' },
    },
    {
        nome: 'E.M.E.F. Mário Nunes Tavares',
        endereco: 'R. Amaro Alves do Rosário, 68',
        bairro: 'Jardim Ângela',
        distancia: '4,8 km',
        horarios: { manha: '07:00', tarde: '13:00', noite: '19:00' },
    },
]

const alunos = [
    'Ana Beatriz Lacerda',
    'Carlos Vinícius Rodrigues',
    'Wilson Roberto',
    'David Santana Barreto',
    'Guilherme Fogaça',
]

const escolaAtual = escolas[0]

const visuais = {
    adicionar: {
        titulo: 'Adicionar ponto à rota',
        icone: LuPlus,
        acao: 'Adicionar ponto',
        exibeCampos: true,
    },
    editar: {
        titulo: 'Editar ponto da rota',
        icone: LuPencil,
        acao: 'Salvar alterações',
        exibeCampos: true,
    },
    'excluir-escola': {
        titulo: 'Excluir escola da rota atual?',
        icone: LuTrash2,
        acao: 'Excluir',
        descricao: ({ escola }) => `${escola.nome} e os alunos vinculados a ela serão removidos da rota atual.`,
    },
    'excluir-aluno': {
        titulo: 'Excluir aluno da rota atual?',
        icone: LuTrash2,
        acao: 'Apagar',
        descricao: ({ aluno }) => `${aluno} sairá da rota atual.`,
    },
}

const AcoesPonto = ({ nome, onEditar, onExcluir }) => (
    <div className={styles.acoes}>
        {onEditar && (
            <button type="button" aria-label={`Editar ${nome}`} aria-haspopup="dialog" onClick={onEditar}>
                <LuPencil aria-hidden="true" />
            </button>
        )}
        <button
            type="button"
            className={styles.excluir}
            aria-label={`Excluir ${nome}`}
            aria-haspopup="dialog"
            onClick={onExcluir}
        >
            <LuTrash2 aria-hidden="true" />
        </button>
    </div>
)

const Rotas = () => {
    const [parametros, setParametros] = useSearchParams()
    const [popup, setPopup] = useState(null)
    const turnoAtual = turnos.find(({ id }) => id === parametros.get('turno')) ?? turnos[0]
    const visual = parametros.get('visual')
    const temPrevia = Object.hasOwn(visuais, visual)
    const popupAtual = popup ?? (temPrevia ? { tipo: visual, escola: escolaAtual, aluno: alunos[0] } : null)
    const visualPopup = popupAtual && visuais[popupAtual.tipo]

    const fecharPopup = useCallback(() => {
        setPopup(null)

        if (temPrevia) {
            setParametros((atuais) => {
                const proximos = new URLSearchParams(atuais)
                proximos.delete('visual')
                return proximos
            }, { replace: true })
        }
    }, [setParametros, temPrevia])

    return (
        <main className={styles.container}>
            <TituloTela title="Suas rotas" subtitle="Quarta-feira, 15 de maio" notificacoesAtivas={false} />

            <div className={styles.conteudo}>
                <section className={styles.secaoTurnos} aria-labelledby="titulo-turnos">
                    <h2 id="titulo-turnos">Turnos</h2>
                    <div className={styles.turnos}>
                        {turnos.map(({ id, nome, icone: Icone, cor }) => (
                            <button key={id} type="button" aria-pressed={id === turnoAtual.id} disabled>
                                <span className={styles.iconeTurno}><Icone color={cor} aria-hidden="true" /></span>
                                {nome}
                            </button>
                        ))}
                    </div>
                </section>

                <div className={styles.painel}>
                    <figure className={styles.mapa}>
                        <MapaRota />
                    </figure>

                    <div className={styles.listas}>
                        <section aria-labelledby="titulo-escolas">
                            <div className={styles.cabecalhoLista}>
                                <h2 id="titulo-escolas">Escolas da rota atual ({escolas.length})</h2>
                                <button
                                    type="button"
                                    className={styles.adicionar}
                                    aria-haspopup="dialog"
                                    onClick={() => setPopup({ tipo: 'adicionar' })}
                                >
                                    <LuPlus aria-hidden="true" />
                                    Adicionar ponto
                                </button>
                            </div>
                            <ul className={styles.escolas}>
                                {escolas.map((escola) => (
                                    <li className={styles.escola} key={escola.nome}>
                                        <span className={styles.iconeEscola}><RiGraduationCapLine aria-hidden="true" /></span>
                                        <div className={styles.dadosEscola}>
                                            <strong>{escola.nome}</strong>
                                            <span>{escola.endereco}</span>
                                            <span>{escola.bairro}</span>
                                        </div>
                                        <div className={styles.infosPonto}>
                                            <time>{escola.horarios[turnoAtual.id]}</time>
                                            <span>{escola.distancia}</span>
                                        </div>
                                        <AcoesPonto
                                            nome={escola.nome}
                                            onEditar={() => setPopup({ tipo: 'editar', escola })}
                                            onExcluir={() => setPopup({ tipo: 'excluir-escola', escola })}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className={styles.secaoAlunos} aria-labelledby="titulo-alunos">
                            <h2 id="titulo-alunos" className={styles.tituloAlunos}>
                                Alunos da escola <span>– {escolaAtual.nome}</span>
                            </h2>
                            <ul className={styles.alunos}>
                                {alunos.map((nome) => (
                                    <li className={styles.aluno} key={nome}>
                                        <LuUserRound aria-hidden="true" />
                                        <span>{nome}</span>
                                        <AcoesPonto
                                            nome={nome}
                                            onExcluir={() => setPopup({ tipo: 'excluir-aluno', aluno: nome })}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>

            {visualPopup && (
                <DialogPontoRota
                    {...visualPopup}
                    descricao={visualPopup.descricao?.(popupAtual)}
                    escola={popupAtual.escola}
                    turno={turnoAtual.id}
                    onClose={fecharPopup}
                />
            )}
        </main>
    )
}

export default Rotas
