import { useState } from 'react'
import {
    PiCalendarBlankBold,
    PiCurrencyCircleDollarBold,
    PiNotePencilBold,
    PiPiggyBankBold,
    PiPlusBold,
    PiTagBold,
} from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEntrada from './CampoEntrada'
import styles from './dialogsFinanceiro.module.css'

const dataLocalAtual = () => {
    const hoje = new Date()
    const offset = hoje.getTimezoneOffset() * 60_000
    return new Date(hoje.getTime() - offset).toISOString().slice(0, 10)
}

const DialogFormularioEntrada = ({ acao, registro, onClose, onSave }) => {
    const editando = acao === 'editar'
    const [valores, setValores] = useState({
        tipo: registro?.tipo || 'Despesa',
        titulo: registro?.titulo || '',
        valor: registro?.valor ?? '',
        data: registro?.data || dataLocalAtual(),
    })

    const alterarCampo = (campo, valor) => {
        setValores((estadoAtual) => ({ ...estadoAtual, [campo]: valor }))
    }

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => alterarCampo(campo, event.target.value),
    })

    const salvar = (event) => {
        event.preventDefault()
        onSave({
            ...valores,
            valor: Number(valores.valor),
        })
    }

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title={editando ? 'Alterar entrada' : 'Nova entrada'}
            description={editando
                ? 'Atualize as informações do lançamento selecionado.'
                : 'Registre uma nova receita ou despesa no financeiro.'}
            icon={editando ? <PiNotePencilBold /> : <PiPiggyBankBold />}
            size="medium"
            className={styles.dialog}
        >
            <form className={styles.form} onSubmit={salvar}>
                <CampoEntrada
                    label="Tipo de entrada"
                    icon={<PiPiggyBankBold />}
                    as="select"
                    {...propsCampo('tipo')}
                    autoFocus
                    required
                >
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                </CampoEntrada>

                <CampoEntrada
                    label="Assunto"
                    icon={<PiTagBold />}
                    {...propsCampo('titulo')}
                    placeholder="Ex.: Combustível"
                    required
                />

                <div className={styles.twoColumns}>
                    <CampoEntrada
                        label="Valor"
                        icon={<PiCurrencyCircleDollarBold />}
                        type="number"
                        min="0.01"
                        step="0.01"
                        inputMode="decimal"
                        {...propsCampo('valor')}
                        placeholder="0,00"
                        required
                    />
                    <CampoEntrada
                        label="Data"
                        icon={<PiCalendarBlankBold />}
                        type="date"
                        {...propsCampo('data')}
                        required
                    />
                </div>

                <button type="submit" className={styles.primaryButton}>
                    {editando
                        ? <PiNotePencilBold aria-hidden="true" />
                        : <PiPlusBold aria-hidden="true" />}
                    {editando ? 'Alterar entrada' : 'Adicionar entrada'}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogFormularioEntrada
