import { useState } from 'react'
import {
    PiAddressBookBold,
    PiBookOpenTextBold,
    PiBuildingsBold,
    PiCalendarBlankBold,
    PiClockBold,
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
import CampoCliente from './CampoCliente'
import styles from './dialogsClientes.module.css'

const valoresIniciais = {
    escola: {
        nome: '',
        telefone: '',
        funcionamento: '',
        endereco: '',
    },
    aluno: {
        nome: '',
        dataNascimento: '',
        turno: '',
        anoEscolar: '',
        informacoesGerais: '',
        responsavel: '',
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
    escola: 'Preencha os dados de contato e funcionamento da escola.',
    aluno: 'Preencha os dados do aluno e selecione o responsável vinculado.',
    responsavel: 'Preencha os dados de identificação e contato do responsável.',
}

const iconesTipo = {
    escola: <PiBuildingsBold />,
    aluno: <PiStudentBold />,
    responsavel: <PiUsersBold />,
}

const DialogFormularioCliente = ({
    acao,
    tipo,
    registro,
    responsaveis = [],
    onClose,
    onSave,
}) => {
    const [valores, setValores] = useState({
        ...valoresIniciais[tipo],
        ...registro,
    })
    const editando = acao === 'editar'
    const verbo = editando ? 'Alterar' : 'Adicionar'

    const alterarCampo = (campo, valor) => {
        setValores((estadoAtual) => ({ ...estadoAtual, [campo]: valor }))
    }

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => alterarCampo(campo, event.target.value),
    })

    const salvar = (event) => {
        event.preventDefault()
        onSave(valores)
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
                        <CampoCliente
                            label="Horário de funcionamento"
                            icon={<PiClockBold />}
                            {...propsCampo('funcionamento')}
                            placeholder="Ex.: 07:00 às 18:00"
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
                            <CampoCliente
                                label="Turno"
                                icon={<PiSunHorizonBold />}
                                as="select"
                                {...propsCampo('turno')}
                                required
                            >
                                <option value="" disabled>Selecione</option>
                                <option value="Manhã">Manhã</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Integral">Integral</option>
                                <option value="Noite">Noite</option>
                            </CampoCliente>
                        </div>
                        <CampoCliente
                            label="Ano escolar"
                            icon={<PiBookOpenTextBold />}
                            {...propsCampo('anoEscolar')}
                            placeholder="Ex.: 3º ano"
                            required
                        />
                        <CampoCliente
                            label="Responsável"
                            icon={<PiUserBold />}
                            as="select"
                            {...propsCampo('responsavel')}
                            required
                        >
                            <option value="" disabled>Selecione um responsável</option>
                            {responsaveis.map((responsavel) => (
                                <option key={responsavel} value={responsavel}>{responsavel}</option>
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
