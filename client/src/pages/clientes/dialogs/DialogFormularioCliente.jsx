import { useEffect, useState } from 'react'
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
    const [turnosDaEscola, setTurnosDaEscola] = useState(() => (
        turnos.filter((turno) => String(turno.escola_id) === String(registro?.id))
    ))
    const [turnosDisponiveis, setTurnosDisponiveis] = useState(turnos)
    const [novoTurno, setNovoTurno] = useState({ turno: 'MANHA', horaEntrada: '', horaSaida: '' })
    const editando = acao === 'editar'
    const verbo = editando ? 'Alterar' : 'Adicionar'

    useEffect(() => {
        setTurnosDaEscola(turnos.filter((turno) => String(turno.escola_id) === String(registro?.id)))
    }, [turnos, registro?.id])

    useEffect(() => {
        if (tipo !== 'aluno') return undefined

        let ativo = true
        listarTurnosEscola()
            .then((dados) => {
                if (ativo) setTurnosDisponiveis(dados)
            })
            .catch(() => {
                if (ativo) setTurnosDisponiveis(turnos)
            })

        return () => {
            ativo = false
        }
    }, [tipo])

    useEffect(() => {
        setTurnosDisponiveis(turnos)
    }, [turnos])

    const alterarCampo = (campo, valor) => {
        setValores((estadoAtual) => ({ ...estadoAtual, [campo]: valor }))
    }

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => alterarCampo(campo, event.target.value),
    })

    const atualizarTurnos = (proximosTurnos) => {
        setTurnosDaEscola(proximosTurnos)
        onTurnosChange?.((turnosAtuais) => [
            ...turnosAtuais.filter((turno) => String(turno.escola_id) !== String(registro?.id)),
            ...proximosTurnos,
        ])
    }

    const adicionarTurno = async () => {
        try {
            const turnoCriado = await criarTurnoEscola({
                ...novoTurno,
                escolaId: registro.id,
            })
            setTurnosDaEscola((atuais) => [...atuais, turnoCriado])
            onTurnosChange?.((turnosAtuais) => {
                if (turnosAtuais.some((turno) => String(turno.id) === String(turnoCriado.id))) {
                    return turnosAtuais
                }

                return [...turnosAtuais, turnoCriado]
            })
            setNovoTurno({ turno: 'MANHA', horaEntrada: '', horaSaida: '' })
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível adicionar o turno.')
        }
    }

    const editarTurno = async (turno) => {
        try {
            const turnoAtualizado = await alterarTurnoEscola(turno.id, {
                turno: turno.turno,
                horaEntrada: turno.hora_entrada,
                horaSaida: turno.hora_saida,
            })
            atualizarTurnos(turnosDaEscola.map((item) => (
                item.id === turno.id ? { ...item, ...turnoAtualizado, ...turno } : item
            )))
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível alterar o turno.')
        }
    }

    const removerTurno = async (id) => {
        try {
            await excluirTurnoEscola(id)
            atualizarTurnos(turnosDaEscola.filter((turno) => turno.id !== id))
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível excluir o turno.')
        }
    }

    const salvar = (event) => {
        event.preventDefault()

        if ((tipo === 'escola' || tipo === 'aluno') && !possuiCoordenadas(valores)) {
            return
        }

        if (tipo === 'aluno' && !valores.escolaTurnoId) {
            return
        }

        onSave(tipo === 'escola'
            ? {
                ...valores,
                turnos: novoTurno.horaEntrada && novoTurno.horaSaida ? [novoTurno] : [],
            }
            : valores)
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
                            icon={<PiMapPinBold /   >}
                            value={valores.endereco}
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
                        {!possuiCoordenadas(valores) && (
                            <p className={styles.coordenadasPendentes}>Escolha uma sugestão para registrar as coordenadas.</p>
                        )}
                        {editando && registro?.id && (
                            <div className={styles.turnosEscola}>
                                <h3>Turnos da escola</h3>
                                {turnosDaEscola.map((turno) => (
                                    <div className={styles.turnoItem} key={turno.id}>
                                        <CampoCliente
                                            label="Tipo"
                                            icon={<PiSunHorizonBold />}
                                            as="select"
                                            value={turno.turno}
                                            onChange={(event) => setTurnosDaEscola((atuais) => atuais.map((item) => (
                                                item.id === turno.id ? { ...item, turno: event.target.value } : item
                                            )))}
                                        >
                                            <option value="INTEGRAL">Integral</option>
                                            <option value="MANHA">Manhã</option>
                                            <option value="TARDE">Tarde</option>
                                            <option value="NOITE">Noite</option>
                                            <option value="INTEGRAL-MANHA">Integral manhã</option>
                                            <option value="INTEGRAL-TARDE">Integral tarde</option>
                                        </CampoCliente>
                                        <CampoCliente label="Entrada" icon={<PiSunHorizonBold />} type="time" value={turno.hora_entrada?.slice(0, 5) || ''} onChange={(event) => setTurnosDaEscola((atuais) => atuais.map((item) => item.id === turno.id ? { ...item, hora_entrada: event.target.value } : item))} />
                                        <CampoCliente label="Saída" icon={<PiSunHorizonBold />} type="time" value={turno.hora_saida?.slice(0, 5) || ''} onChange={(event) => setTurnosDaEscola((atuais) => atuais.map((item) => item.id === turno.id ? { ...item, hora_saida: event.target.value } : item))} />
                                        <button type="button" className={styles.primaryButton} onClick={() => editarTurno(turno)}>Salvar turno</button>
                                        <button type="button" className={styles.primaryButton} onClick={() => removerTurno(turno.id)}>Excluir turno</button>
                                    </div>
                                ))}
                                <div className={styles.turnoItem}>
                                    <CampoCliente
                                        label="Novo turno"
                                        icon={<PiSunHorizonBold />}
                                        as="select"
                                        value={novoTurno.turno}
                                        onChange={(event) => setNovoTurno((atual) => ({ ...atual, turno: event.target.value }))}
                                    >
                                        <option value="INTEGRAL">Integral</option>
                                        <option value="MANHA">Manhã</option>
                                        <option value="TARDE">Tarde</option>
                                        <option value="NOITE">Noite</option>
                                        <option value="INTEGRAL-MANHA">Integral manhã</option>
                                        <option value="INTEGRAL-TARDE">Integral tarde</option>
                                    </CampoCliente>
                                    <CampoCliente label="Entrada" icon={<PiSunHorizonBold />} type="time" value={novoTurno.horaEntrada} onChange={(event) => setNovoTurno((atual) => ({ ...atual, horaEntrada: event.target.value }))} />
                                    <CampoCliente label="Saída" icon={<PiSunHorizonBold />} type="time" value={novoTurno.horaSaida} onChange={(event) => setNovoTurno((atual) => ({ ...atual, horaSaida: event.target.value }))} />
                                    <button type="button" className={styles.primaryButton} onClick={adicionarTurno}>Adicionar turno</button>
                                </div>
                            </div>
                        )}
                        {!editando && (
                            <div className={styles.turnoItem}>
                                <h3>Turno inicial (opcional)</h3>
                                <CampoCliente
                                    label="Tipo"
                                    icon={<PiSunHorizonBold />}
                                    as="select"
                                    value={novoTurno.turno}
                                    onChange={(event) => setNovoTurno((atual) => ({ ...atual, turno: event.target.value }))}
                                >
                                    <option value="INTEGRAL">Integral</option>
                                    <option value="MANHA">Manhã</option>
                                    <option value="TARDE">Tarde</option>
                                    <option value="NOITE">Noite</option>
                                    <option value="INTEGRAL-MANHA">Integral manhã</option>
                                    <option value="INTEGRAL-TARDE">Integral tarde</option>
                                </CampoCliente>
                                <CampoCliente label="Entrada" icon={<PiSunHorizonBold />} type="time" value={novoTurno.horaEntrada} onChange={(event) => setNovoTurno((atual) => ({ ...atual, horaEntrada: event.target.value }))} />
                                <CampoCliente label="Saída" icon={<PiSunHorizonBold />} type="time" value={novoTurno.horaSaida} onChange={(event) => setNovoTurno((atual) => ({ ...atual, horaSaida: event.target.value }))} />
                            </div>
                        )}
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
                        {!possuiCoordenadas(valores) && (
                            <p className={styles.coordenadasPendentes}>Escolha uma sugestão para registrar as coordenadas.</p>
                        )}
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
                        <CampoCliente
                            label="Endereço"
                            icon={<PiMapPinBold />}
                            {...propsCampo('endereco')}
                            placeholder="Rua, número, bairro e cidade"
                            autoComplete="street-address"
                            required
                        />
                    </>
                )}

                <button type="submit" className={styles.primaryButton}>
                    {editando ? <PiNotePencilBold aria-hidden="true" /> : <PiPlusBold aria-hidden="true" />}
                    {verbo} {nomesTipo[tipo]}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogFormularioCliente
