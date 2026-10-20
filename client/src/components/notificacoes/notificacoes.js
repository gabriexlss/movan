// isso aqui é tudo estático só pra exemplo da notificação, pode apagar o arquivo dps ou usar ele pro script das notificações mesmo

import {
    PiArrowsClockwiseBold,
    PiCurrencyDollarBold,
    PiTimerBold,
    PiUserPlusBold,
    PiWarningBold,
} from 'react-icons/pi'

export const notificacoes = [
    {
        id: 'rota-iniciada',
        titulo: 'Sua rota já começou',
        descricao: 'O motorista já iniciou o trajeto. Acompanhe em tempo real.',
        tempo: '2m',
        acao: 'Ver rota',
        Icone: PiTimerBold,
        cor: '#f7b928',
    },
    {
        id: 'rota-iniciad',
        titulo: 'Sua rota já começou',
        descricao: 'O motorista já iniciou o trajeto. Acompanhe em tempo real.',
        tempo: '2m',
        acao: 'Ver rota',
        Icone: PiTimerBold,
        cor: '#f7b928',
    },
    {
        id: 'mensalidade-pendente',
        titulo: 'Mensalidade pendente',
        descricao: 'Identificamos alguns pagamentos aguardando confirmação.',
        tempo: '1h',
        acao: 'Ver mensalidade',
        Icone: PiCurrencyDollarBold,
        cor: '#21853a',
    },
    {
        id: 'atualizacao-sistema',
        titulo: 'Atualização do sistema',
        descricao: 'Novos recursos e melhorias já estão disponíveis para você.',
        tempo: '3h',
        acao: 'Ver',
        Icone: PiWarningBold,
        cor: '#0d47a1',
    },
    {
        id: 'mudancas-rota',
        titulo: 'Mudanças na rota',
        descricao: 'Alguns horários foram atualizados. Confira as alterações.',
        tempo: '1d',
        acao: 'Ver rota',
        Icone: PiArrowsClockwiseBold,
        cor: '#9445e6',
    },
    {
        id: 'novo-cadastro',
        titulo: 'Novo cadastro realizado',
        descricao: 'Uma criança foi adicionada com sucesso.',
        tempo: '2d',
        acao: 'Ver aluno',
        Icone: PiUserPlusBold,
        cor: '#f7b928',
    },
]

export const quantidadeNotificacoesNaoLidas = notificacoes.filter(
    ({ lida }) => !lida,
).length
