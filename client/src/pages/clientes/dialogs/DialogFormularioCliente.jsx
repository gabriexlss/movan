import { useEffect, useRef, useState } from 'react'
import {
    PiAddressBookBold,
    PiBookOpenTextBold,
    PiBuildingsBold,
    PiCalendarBlankBold,
    PiEnvelopeSimpleBold,
    PiIdentificationCardBold,
    PiMapPinBold,
    PiNotePencilBold,
    PiPhoneBold,
    PiPlusBold,
    PiStudentBold,
    PiSunHorizonBold,
    PiUserBold,
    PiUsersBold,
} from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import { alterarTurnoEscola, criarTurnoEscola, excluirTurnoEscola, listarTurnosEscola } from '../../../services/turnosEscola'
import toast from 'react-hot-toast'
import CampoCliente from './CampoCliente'
import CampoEnderecoAutocomplete from '../components/CampoEnderecoAutocomplete'
import TurnosEscola from '../components/TurnosEscola'
import styles from './dialogsClientes.module.css'

const valoresIniciais = {
    escola: {
        nome: '',
        telefone: '',
        endereco: '',
        latitude: null,
        longitude: null,
    },
    aluno: {
        nome: '',
        dataNascimento: '',
        escolaTurnoId: '',
        anoEscolar: '',
        informacoesGerais: '',
        responsavel: '',
        responsavelId: '',
        escolaId: '',
        endereco: '',
        latitude: null,
        longitude: null,
    },
    responsavel: {
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        endereco: '',
    },
}

const nomesTipo = {
    escola: 'escola',
    aluno: 'aluno',
    responsavel: 'responsável',
}

const descricoes = {
    escola: 'Preencha os dados de contato da escola.',
    aluno: 'Preencha os dados do aluno e selecione o responsável vinculado.',
    responsavel: 'Preencha os dados de identificação e contato do responsável.',
}

const iconesTipo = {
    escola: <PiBuildingsBold />,
    aluno: <PiStudentBold />,
    responsavel: <PiUsersBold />,
}

const possuiCoordenadas = (valores) => [valores.latitude, valores.longitude].every((valor) => (
    valor !== null && valor !== '' && Number.isFinite(Number(valor))
))

const DialogFormularioCliente = ({
    acao,
    tipo,
    registro,
    responsaveis = [],
    escolas = [],
    turnos = [],
    onTurnosChange,
    onClose,
    onSave,
}) => {
    const [valores, setValores] = useState({
        ...valoresIniciais[tipo],
        ...registro,
    })
    const [turnosCarregados, setTurnosCarregados] = useState(null)
    const turnosDisponiveis = turnosCarregados ?? turnos
    const [turnosNovos, setTurnosNovos] = useState([])
    const [alteracoesTurnos, setAlteracoesTurnos] = useState({})
    const [turnosRemovidos, setTurnosRemovidos] = useState([])
    const [salvando, setSalvando] = useState(false)
    const proximoTurno = useRef(0)
    const editando = acao === 'editar'
    const verbo = editando ? 'Alterar' : 'Adicionar'
    const turnosCadastrados = turnos.filter((turno) => String(turno.escola_id) === String(registro?.id))
    const turnosDaEscola = [
        ...turnosCadastrados
            .filter((turno) => !turnosRemovidos.includes(turno.id))
            .map((turno) => ({
                chave: String(turno.id),
                turno: turno.turno,
                horaEntrada: turno.hora_entrada?.slice(0, 5) || '',
                horaSaida: turno.hora_saida?.slice(0, 5) || '',
                ...alteracoesTurnos[String(turno.id)],
            })),
        ...turnosNovos,
    ]

    useEffect(() => {
        if (tipo !== 'aluno') return undefined

        let ativo = true
        listarTurnosEscola()
            .then((dados) => {
                if (ativo) setTurnosCarregados(dados)
            })
            .catch(() => {
                if (ativo) setTurnosCarregados(null)
            })

        return () => {
            ativo = false
        }
    }, [tipo])

    const alterarCampo = (campo, valor) => {
        setValores((estadoAtual) => ({ ...estadoAtual, [campo]: valor }))
    }

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => alterarCampo(campo, event.target.value),
    })

    const adicionarTurno = () => {
        const chave = `novo-${++proximoTurno.current}`
        setTurnosNovos((atuais) => [...atuais, {
            chave,
            turno: 'MANHA',
            horaEntrada: '',
            horaSaida: '',
        }])
    }

    const alterarTurno = (chave, campo, valor) => {
        if (chave.startsWith('novo-')) {
            setTurnosNovos((atuais) => atuais.map((turno) => (
                turno.chave === chave ? { ...turno, [campo]: valor } : turno
            )))
        } else {
            setAlteracoesTurnos((atuais) => ({
                ...atuais,
                [chave]: { ...atuais[chave], [campo]: valor },
            }))
        }
    }

    const removerTurno = (chave) => {
        if (chave.startsWith('novo-')) {
            setTurnosNovos((atuais) => atuais.filter((turno) => turno.chave !== chave))
        } else {
            const turno = turnosCadastrados.find((item) => String(item.id) === chave)
            setTurnosRemovidos((atuais) => [...atuais, turno.id])
        }
    }

    const salvarTurnos = async () => {
        for (const id of turnosRemovidos) {
            await excluirTurnoEscola(id)
            onTurnosChange?.((atuais) => atuais.filter((turno) => turno.id !== id))
            setTurnosRemovidos((atuais) => atuais.filter((item) => item !== id))
        }

        for (const turno of turnosDaEscola.filter((item) => alteracoesTurnos[item.chave])) {
            const atualizado = await alterarTurnoEscola(turno.chave, turno)
            onTurnosChange?.((atuais) => atuais.map((item) => String(item.id) === turno.chave ? {
                ...item,
                ...atualizado,
                turno: turno.turno,
                hora_entrada: turno.horaEntrada,
                hora_saida: turno.horaSaida,
            } : item))
            setAlteracoesTurnos((atuais) => {
                const proximas = { ...atuais }
                delete proximas[turno.chave]
                return proximas
            })
        }

        for (const turno of turnosNovos) {
            const criado = await criarTurnoEscola({ ...turno, escolaId: registro.id })
            onTurnosChange?.((atuais) => [...atuais, criado])
            setTurnosNovos((atuais) => atuais.filter((item) => item.chave !== turno.chave))
        }
    }

    const salvar = async (event) => {
        event.preventDefault()
        if (salvando) return

        if ((tipo === 'escola' || tipo === 'aluno') && !possuiCoordenadas(valores)) {
            return
        }

        if (tipo === 'aluno' && !valores.escolaTurnoId) {
            return
        }

        setSalvando(true)
        try {
            if (tipo === 'escola' && editando) await salvarTurnos()
            await onSave(tipo === 'escola' ? { ...valores, turnos: turnosNovos } : valores)
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível salvar as alterações. Tente novamente.')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title={`${verbo} ${nomesTipo[tipo]}`}
            description={descricoes[tipo]}
            icon={editando ? <PiNotePencilBold /> : iconesTipo[tipo]}
            size="medium"
            className={styles.dialog}
        >
            <form className={styles.form} onSubmit={salvar}>
                {tipo === 'escola' && (
                    <>
                        <CampoCliente
                            label="Nome da escola"
                            icon={<PiBuildingsBold />}
                            {...propsCampo('nome')}
                            placeholder="Nome da escola"
                            autoComplete="organization"
                            required
                            autoFocus
                        />
                        <CampoCliente
                            label="Telefone de contato"
                            icon={<PiPhoneBold />}
                            type="tel"
                            {...propsCampo('telefone')}
                            placeholder="(00) 00000-0000"
                            autoComplete="tel"
                            required
                        />
                        <CampoEnderecoAutocomplete
                            icon={<PiMapPinBold />}
                            value={valores.endereco}
                            coordenadasPendentes={!possuiCoordenadas(valores)}
                            onChange={(endereco) => setValores((estadoAtual) => ({
                                ...estadoAtual,
                                endereco,
                                latitude: null,
                                longitude: null,
                            }))}
                            onSelecionar={(enderecoSelecionado) => setValores((estadoAtual) => ({
                                ...estadoAtual,
                                ...enderecoSelecionado,
                            }))}
                        />
                        <TurnosEscola
                            turnos={turnosDaEscola}
                            onAdicionar={adicionarTurno}
                            onAlterar={alterarTurno}
                            onRemover={removerTurno}
                            disabled={salvando}
                        />
                    </>
                )}

                {tipo === 'aluno' && (
                    <>
                        <CampoCliente
                            label="Nome do aluno"
                            icon={<PiStudentBold />}
                            {...propsCampo('nome')}
                            placeholder="Nome completo"
                            autoComplete="name"
                            required
                            autoFocus
                        />
                        <div className={styles.twoColumns}>
                            <CampoCliente
                                label="Data de nascimento"
                                icon={<PiCalendarBlankBold />}
                                type="date"
                                {...propsCampo('dataNascimento')}
                                required
                            />
                        </div>
                        <CampoCliente
                            label="Ano escolar"
                            icon={<PiBookOpenTextBold />}
                            {...propsCampo('anoEscolar')}
                            placeholder="Ex.: 3º ano"
                            maxLength={10}
                            required
                        />
                        <CampoCliente
                            label="Responsável"
                            icon={<PiUserBold />}
                            as="select"
                            value={valores.responsavelId || valores.responsavel}
                            onChange={(event) => {
                                const responsavelSelecionado = responsaveis.find((item) => (
                                    typeof item === 'object' && String(item.id) === event.target.value
                                ))

                                setValores((estadoAtual) => ({
                                    ...estadoAtual,
                                    responsavelId: event.target.value,
                                    responsavel: responsavelSelecionado?.nome || event.target.value,
                                }))
                            }}
                            required
                        >
                            <option value="" disabled>Selecione um responsável</option>
                            {responsaveis.map((responsavel) => (
                                <option
                                    key={typeof responsavel === 'object' ? responsavel.id : responsavel}
                                    value={typeof responsavel === 'object' ? responsavel.id : responsavel}
                                >
                                    {typeof responsavel === 'object' ? responsavel.nome : responsavel}
                                </option>
                            ))}
                        </CampoCliente>
                        <CampoCliente
                            label="Escola"
                            icon={<PiBuildingsBold />}
                            as="select"
                                value={valores.escolaId}
                                onChange={(event) => setValores((estadoAtual) => ({
                                    ...estadoAtual,
                                    escolaId: event.target.value,
                                    escolaTurnoId: '',
                                }))}
                            required
                        >
                            <option value="" disabled>Selecione uma escola</option>
                            {escolas.map((escola) => (
                                <option key={escola.id} value={escola.id}>{escola.nome}</option>
                            ))}
                        </CampoCliente>
                        <CampoCliente
                            label="Turno da escola"
                            icon={<PiSunHorizonBold />}
                            as="select"
                            {...propsCampo('escolaTurnoId')}
                            required
                            disabled={!valores.escolaId}
                        >
                            <option value="" disabled>
                                {valores.escolaId ? 'Selecione um turno' : 'Selecione primeiro uma escola'}
                            </option>
                            {turnosDisponiveis
                                .filter((turno) => String(turno.escola_id) === String(valores.escolaId))
                                .map((turno) => (
                                    <option key={turno.id} value={turno.id}>
                                        {turno.turno} ({turno.hora_entrada} - {turno.hora_saida})
                                    </option>
                                ))}
                        </CampoCliente>
                        <CampoCliente
                            label="Informações gerais"
                            icon={<PiAddressBookBold />}
                            as="textarea"
                            {...propsCampo('informacoesGerais')}
                            placeholder="Alergias, observações ou informações importantes"
                            rows={3}
                        />
                        <CampoEnderecoAutocomplete
                            icon={<PiMapPinBold />}
                            value={valores.endereco}
                            coordenadasPendentes={!possuiCoordenadas(valores)}
                            onChange={(endereco) => setValores((estadoAtual) => ({
                                ...estadoAtual,
                                endereco,
                                latitude: null,
                                longitude: null,
                            }))}
                            onSelecionar={(enderecoSelecionado) => setValores((estadoAtual) => ({
                                ...estadoAtual,
                                ...enderecoSelecionado,
                            }))}
                        />
                    </>
                )}

                {tipo === 'responsavel' && (
                    <>
                        <CampoCliente
                            label="Nome do responsável"
                            icon={<PiUserBold />}
                            {...propsCampo('nome')}
                            placeholder="Nome completo"
                            autoComplete="name"
                            required
                            autoFocus
                        />
                        <CampoCliente
                            label="E-mail"
                            icon={<PiEnvelopeSimpleBold />}
                            type="email"
                            {...propsCampo('email')}
                            placeholder="email@exemplo.com"
                            autoComplete="email"
                            required
                        />
                        <CampoCliente
                            label="CPF"
                            icon={<PiIdentificationCardBold />}
                            {...propsCampo('cpf')}
                            placeholder="000.000.000-00"
                            inputMode="numeric"
                            maxLength={14}
                            required
                        />
                        <CampoCliente
                            label="Telefone"
                            icon={<PiPhoneBold />}
                            type="tel"
                            {...propsCampo('telefone')}
                            placeholder="(00) 00000-0000"
                            autoComplete="tel"
                            required
                        />
                        <CampoEnderecoAutocomplete
                            icon={<PiMapPinBold />}
                            value={valores.endereco}
                            coordenadasPendentes={!possuiCoordenadas(valores)}
                            onChange={(endereco) => setValores((estadoAtual) => ({
                                ...estadoAtual,
                                endereco,
                                latitude: null,
                                longitude: null,
                            }))}
                            onSelecionar={(enderecoSelecionado) => setValores((estadoAtual) => ({
                                ...estadoAtual,
                                ...enderecoSelecionado,
                            }))}
                        />
                    </>
                )}

                <button type="submit" className={styles.primaryButton} disabled={salvando}>
                    {editando ? <PiNotePencilBold aria-hidden="true" /> : <PiPlusBold aria-hidden="true" />}
                    {salvando ? 'Salvando...' : `${verbo} ${nomesTipo[tipo]}`}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogFormularioCliente
