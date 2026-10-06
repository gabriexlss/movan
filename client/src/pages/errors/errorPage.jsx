import { Link, useLocation } from 'react-router-dom'
import styles from './errorPage.module.css'


import IconeErro from '../../assets/media/img/error-img.png'

const errorMessages = {
	400: {
		code: "400",
		title: "Requisição inválida",
		desc: "Os dados enviados foram preenchidos indevidamente. Verifique as informações e tente novamente"
	},

	401: {
		code: "401",
		title: "Não autorizado",
		desc: "Não foi possível validar suas credenciais. Tente novamente mais tarde."
	},

	403: {
		code: "403",
		title: "Acesso negado",
		desc: "Você não tem permissão para realizar esta ação."
	},

	404: {
		code: "404",
		title: "Não encontrado",
		desc: "A página solicitada não foi encontrada ou mudou de endereço."
	},

	409: {
		code: "409",
		title: "Conflito de dados",
		desc: "Operação não pode ser concluída pois existem conflitos nos dados."
	},

	413: {
		code: "413",
		title: "Dados muito grandes",
		desc: "A quantidade de dados enviada ultrapassa o limite permitido pelo servidor."
	},

	500: {
		code: "500",
		title: "Erro interno no servidor",
		desc: "O servidor encontrou um problema inesperado. Tente novamente mais tarde."
	},

	503: {
		code: "503",
		title: "Serviço indisponível",
		desc: "O servidor está temporariamente indisponível. Tente novamente mais tarde."
	},
	
	default: {
		code: "ERRO",
		title: "Ops! Algo deu errado",
		desc: "Ocorreu um erro inesperado em nosso sistema. Por favor, tente novamente mais tarde."
	}
}

const getErrorMessage = (errorCode) => {
	const normalizedErrorCode = String(errorCode || '').trim()
	return errorMessages[normalizedErrorCode] || errorMessages.default
}

const ErrorPage = () => {

	const { state } = useLocation()
	const errorCode = state?.errorCode || sessionStorage.getItem('movan:errorcode')
	const error = getErrorMessage(errorCode)

	return (
		<div className={styles['errorPage-container']}>
			<img src={IconeErro} className={styles['iconeErro']} alt="Ilustração de erro" />

			<h1>{error.code}</h1>
			<h2>{error.title}</h2>
			<p>{error.desc}</p>

			<Link to="/">Voltar ao Início</Link>
		</div>
	)
}

export default ErrorPage
