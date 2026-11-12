import { useEffect, useState } from 'react'
import { FaRegFileAlt } from 'react-icons/fa'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import { listarAluno } from '../../../services/aluno'
import { listarEscola } from '../../../services/escola'
import { listarResponsaveis } from '../../../services/responsaveis'
import styles from './dialogContrato.module.css'

const DialogContrato = ({ onClose, onSave }) => {
    const [responsaveis, setResponsaveis] = useState([])
    const [alunos, setAlunos] = useState([])
    const [escolas, setEscolas] = useState([])
    const [carregandoOpcoes, setCarregandoOpcoes] = useState(true)
    const [valores, setValores] = useState({
        titulo: 'Contrato de prestação de serviços',
        cliente: '',
        aluno: '',
        escola: '',
        inicio: '',
        termino: '',
    })

    useEffect(() => {
        let ativo = true

        Promise.all([listarResponsaveis(), listarAluno(), listarEscola()])
            .then(([dadosResponsaveis, dadosAlunos, dadosEscolas]) => {
                if (ativo) {
                    setResponsaveis(dadosResponsaveis)
                    setAlunos(dadosAlunos)
                    setEscolas(dadosEscolas)
                }
            })
            .finally(() => {
                if (ativo) {
                    setCarregandoOpcoes(false)
                }
            })

        return () => {
            ativo = false
        }
    }, [])

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => setValores((estadoAtual) => ({
            ...estadoAtual,
            [campo]: event.target.value,
        })),
    })

    const salvar = (event) => {
        event.preventDefault()
        onSave({ ...valores, titulo: valores.titulo.trim() })
    }

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Novo contrato"
            description="Preencha os dados do contrato."
            icon={<FaRegFileAlt />}
            className={styles.dialog}
        >
            <form className={styles.formulario} onSubmit={salvar}>
                <label className={styles.campo}>
                    Título
                    <input {...propsCampo('titulo')} required pattern=".*\S.*" data-autofocus="true" />
                </label>
                <label className={styles.campo}>
                    Responsável
                    <select {...propsCampo('cliente')} required>
                        <option value="">
                            {carregandoOpcoes ? 'Carregando responsáveis...' : 'Selecione um responsável'}
                        </option>
                        {!carregandoOpcoes && responsaveis.map((responsavel) => (
                            <option key={responsavel.id} value={responsavel.nome}>{responsavel.nome}</option>
                        ))}
                    </select>
                </label>
                <label className={styles.campo}>
                    Aluno
                    <select {...propsCampo('aluno')} required>
                        <option value="">
                            {carregandoOpcoes ? 'Carregando alunos...' : 'Selecione um aluno'}
                        </option>
                        {!carregandoOpcoes && alunos.map((aluno) => (
                            <option key={aluno.id} value={aluno.nome}>{aluno.nome}</option>
                        ))}
                    </select>
                </label>
                <label className={styles.campo}>
                    Escola
                    <select {...propsCampo('escola')} required>
                        <option value="">
                            {carregandoOpcoes ? 'Carregando escolas...' : 'Selecione uma escola'}
                        </option>
                        {!carregandoOpcoes && escolas.map((escola) => (
                            <option key={escola.id} value={escola.nome}>{escola.nome}</option>
                        ))}
                    </select>
                </label>
                <div className={styles.duasColunas}>
                    <label className={styles.campo}>
                        Início
                        <input type="date" {...propsCampo('inicio')} max={valores.termino || undefined} required />
                    </label>
                    <label className={styles.campo}>
                        Término
                        <input type="date" {...propsCampo('termino')} min={valores.inicio || undefined} required />
                    </label>
                </div>
                <button type="submit" className={styles.salvar}>Adicionar contrato</button>
            </form>
        </DefaultDialog>
    )
}

export default DialogContrato
