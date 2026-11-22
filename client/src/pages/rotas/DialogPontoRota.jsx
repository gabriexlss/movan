import { useState } from 'react'
import { LuPlus, LuTrash2 } from 'react-icons/lu'

import DefaultDialog from '../../components/dialog/dialogDefault'
import styles from './rota.module.css'

const DialogPontoRota = ({
    tipo,
    escola,
    aluno,
    alunosDisponiveis = [],
    escolas = [],
    onConfirm,
    onClose,
}) => {
    const [alunoSelecionadoId, setAlunoSelecionadoId] = useState('')
    const [processando, setProcessando] = useState(false)

    const adicionando = tipo === 'adicionar'
    const excluindoEscola = tipo === 'excluir-escola'

    const titulo = adicionando
        ? 'Adicionar aluno à rota'
        : excluindoEscola
            ? 'Excluir escola da rota atual?'
            : 'Excluir aluno da rota atual?'

    const descricao = adicionando
        ? 'Selecione um aluno cadastrado para incluir nesta rota. A escola dele será adicionada automaticamente caso ainda não esteja presente.'
        : excluindoEscola
            ? `${escola?.nome || 'Esta escola'} e os alunos vinculados a ela serão removidos da rota atual.`
            : `${aluno?.nome || 'Este aluno'} sairá da rota atual.`

    const Icone = adicionando ? LuPlus : LuTrash2

    const obterNomeEscola = (escolaId) => (
        escolas.find((item) => String(item.id) === String(escolaId))?.nome || ''
    )

    const confirmar = async (event) => {
        event?.preventDefault()
        if (processando) return
        if (adicionando && !alunoSelecionadoId) return

        setProcessando(true)
        try {
            await onConfirm(adicionando ? alunoSelecionadoId : undefined)
        } finally {
            setProcessando(false)
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={processando ? () => {} : onClose}
            title={titulo}
            description={descricao}
            icon={<Icone />}
            size="small"
            className={styles.modal}
        >
            {adicionando ? (
                <form onSubmit={confirmar} aria-busy={processando}>
                    <div className={styles.camposPonto}>
                        {alunosDisponiveis.length > 0 ? (
                            <label className={styles.campoSelect}>
                                Aluno
                                <select
                                    value={alunoSelecionadoId}
                                    onChange={(event) => setAlunoSelecionadoId(event.target.value)}
                                    required
                                    disabled={processando}
                                    data-autofocus="true"
                                >
                                    <option value="">Selecione um aluno</option>
                                    {alunosDisponiveis.map((item) => {
                                        const nomeEscola = obterNomeEscola(item.escola_id)
                                        return (
                                            <option key={item.id} value={item.id}>
                                                {nomeEscola ? `${item.nome} — ${nomeEscola}` : item.nome}
                                            </option>
                                        )
                                    })}
                                </select>
                            </label>
                        ) : (
                            <p className={styles.mensagemVazia}>
                                Todos os alunos cadastrados já estão incluídos nesta rota.
                            </p>
                        )}
                    </div>
                    <div className={styles.botoesModal}>
                        <button
                            type="submit"
                            disabled={processando || !alunoSelecionadoId || alunosDisponiveis.length === 0}
                        >
                            {processando ? 'Adicionando...' : 'Adicionar ponto'}
                        </button>
                        <button
                            type="button"
                            className={styles.botaoCancelar}
                            disabled={processando}
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.botoesModal}>
                    <button
                        type="button"
                        className={styles.botaoDestrutivo}
                        disabled={processando}
                        onClick={confirmar}
                    >
                        {processando ? 'Removendo...' : (excluindoEscola ? 'Excluir' : 'Apagar')}
                    </button>
                    <button
                        type="button"
                        className={styles.botaoCancelar}
                        data-autofocus="true"
                        disabled={processando}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </DefaultDialog>
    )
}

export default DialogPontoRota
