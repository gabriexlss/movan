import ListaClientes from './ListaClientes'

const alunos = [
    { nome: 'Bruno Nogueira', detalhes: ['Responsável: Bianca Nogueira', '5 anos · Infantil 3'] },
    { nome: 'Beatriz Nogueira', detalhes: ['Responsável: Bianca Nogueira', '3 anos · Infantil 1'] },
    { nome: 'João Teixeira', detalhes: ['Responsável: Thiago Teixeira', '7 anos · 2º ano'] },
    { nome: 'Mariana Teixeira', detalhes: ['Responsável: Thiago Teixeira', '9 anos · 4º ano'] },
    { nome: 'Lucas Fabrício', detalhes: ['Responsável: Carlos Fabrício', '6 anos · 1º ano'] },
    { nome: 'Ana Manuel', detalhes: ['Responsável: Ricardo Manuel', '8 anos · 3º ano'] },
]

const Alunos = () => {
    return <ListaClientes title="Lista de alunos" tipo="aluno" registros={alunos} />
}

export default Alunos
