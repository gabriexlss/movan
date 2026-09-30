import ListaClientes from './ListaClientes'

const nomesResponsaveis = [
    'Bianca Nogueira',
    'Thiago Teixeira',
    'Carlos Fabrício',
    'Ricardo Manuel',
]

const alunos = [
    { id: 'aluno-1', nome: 'Bruno Nogueira', dataNascimento: '2021-03-14', turno: 'Manhã', anoEscolar: 'Infantil 3', informacoesGerais: '', responsavel: 'Bianca Nogueira', detalhes: ['Responsável: Bianca Nogueira', '5 anos · Infantil 3'] },
    { id: 'aluno-2', nome: 'Beatriz Nogueira', dataNascimento: '2023-06-08', turno: 'Tarde', anoEscolar: 'Infantil 1', informacoesGerais: '', responsavel: 'Bianca Nogueira', detalhes: ['Responsável: Bianca Nogueira', '3 anos · Infantil 1'] },
    { id: 'aluno-3', nome: 'João Teixeira', dataNascimento: '2019-01-22', turno: 'Manhã', anoEscolar: '2º ano', informacoesGerais: '', responsavel: 'Thiago Teixeira', detalhes: ['Responsável: Thiago Teixeira', '7 anos · 2º ano'] },
    { id: 'aluno-4', nome: 'Mariana Teixeira', dataNascimento: '2017-09-11', turno: 'Tarde', anoEscolar: '4º ano', informacoesGerais: '', responsavel: 'Thiago Teixeira', detalhes: ['Responsável: Thiago Teixeira', '9 anos · 4º ano'] },
    { id: 'aluno-5', nome: 'Lucas Fabrício', dataNascimento: '2020-05-17', turno: 'Integral', anoEscolar: '1º ano', informacoesGerais: '', responsavel: 'Carlos Fabrício', detalhes: ['Responsável: Carlos Fabrício', '6 anos · 1º ano'] },
    { id: 'aluno-6', nome: 'Ana Manuel', dataNascimento: '2018-12-03', turno: 'Manhã', anoEscolar: '3º ano', informacoesGerais: '', responsavel: 'Ricardo Manuel', detalhes: ['Responsável: Ricardo Manuel', '8 anos · 3º ano'] },
]

const Alunos = () => {
    return <ListaClientes title="Lista de alunos" tipo="aluno" registros={alunos} responsaveis={nomesResponsaveis} />
}

export default Alunos
