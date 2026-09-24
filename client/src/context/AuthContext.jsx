import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from './auth-context'

const rotasPublicas = [
    '/login',
    '/cadastro',
    '/cadastro-google',
    '/recuperar-senha',
    '/codigo-enviado',
    '/redefinir-senha',
    '/error',
]

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate() //isso mandar para outra pagina
    const { pathname } = useLocation() //guarda o caminho da pagina atual do usuario
    const [user, setUser] = useState(null)//essa variavel define se o usuario esta logado, alem de guardar as informações dele caso esteja logado
    const [isLoading, setIsLoading] = useState(true)//esse is loading fala que ta carregando
//=======================
//CARREGAR SESSÃO
//=======================
    const loadSession = useCallback(async () => {
        try {
            const health = await api.get('/health', { skipGlobalErrorToast: true }) //verifica se o backend esta online
            if (health.status !== 200) { //se dar algum erro
                setUser(null)//deixa o usuario nulo
                navigate('/error', { replace: true })//manda para a pagina de erro
                return //paro a execução
            }
        } catch {
            setUser(null)
            setIsLoading(false)
            navigate('/error', { replace: true })
            return
        }

        try {
            const response = await api.get('/motorista', { skipGlobalErrorToast: true })//pega as informacoes do usuario logado
            const motorista = response.data.motorista //pega as informacoes do usuario logadoo
            setUser(motorista) //guarda as informações do usuario logado

            if(motorista.verificado === false){
                navigate('/codigo-enviado', { replace: true, state: { fluxo: 'cadastro', autoSendVerification: true } }) //manda para a pagina de codigo enviado caso o usuario não esteja verificado
            } else {
                navigate('/', { replace: true }) //manda para a pagina inicial caso o usuario esteja verificado
            }
        } catch {
            setUser(null) //qualquer falha ao carregar a sessão significa que o usuário está deslogado
        } finally {
            setIsLoading(false)
        }
    }, [navigate])

//=======================
//LIDAR COM SESSÃO EXPIRADA
//=======================
    useEffect(() => { //tudo aqui no useEffect acontece quando o componente é montando, ou seja antes mesmo de ser renderizado
        const handleSessionExpired = () => { //essa variavel é chamada quando uma sessão expira
            setUser(null)//deixa tudo nulo ou falso 
            setIsLoading(false)

            if (!rotasPublicas.includes(pathname)) { //caso a rota atual do usuario não for uma rota publica
                navigate('/login', { replace: true }) //manda pro login
            }
        }

        window.addEventListener('auth:expired', handleSessionExpired) //ele vai ficar verificando se a sessão expirou, caso tenha expirado chama o HandleSessionExpired
        const sessionLoader = window.setTimeout(loadSession, 0)//chama a variavel de carregar a sessão assim que possivel

        return () => { //tudo que esta aqui acontece quando o componente é desmontado, ou seja quando ele vai ser descarregado da tela
            window.clearTimeout(sessionLoader)//tira o timeout de carregar a sessão
            window.removeEventListener('auth:expired', handleSessionExpired)//tira o evento de sessão expirada
        }
    }, [loadSession, navigate, pathname])


    //=======================
    //LOGIN
    //=======================
    const login = useCallback(async (credentials) => {
        await api.post('/motorista/login', credentials) //pega as credenciais do usuario e devolve pra rota do backend que verifica se o usuario existe e esta correto
        await loadSession()//espera para ver se o usuario esta correto
    }, [loadSession])

    //=======================
    //LOGOUT
    //=======================
    const logout = useCallback(async () => {
        await api.delete('/motorista/logout') //chama a rota de logout do backend que acaba com a sessão do usuario
        setUser(null) //deixa o usuario nulo
        navigate('/login', { replace: true }) //manda para o login
    }, [navigate])

    const value = useMemo(() => ({ //ele guarda na memoria as informações do usuario até que elas mudem, isso evita que o AuthContext fique renderizando toda hora
        user, //gurada as informações do usuario
        isLoading, //guarda se esta carregando
        isAuthenticated: user !== null, //fala se o usuario esta logado
        login, //função de login
        logout,// função de logout
        refreshSession: loadSession, //função de carregar a sessão (so que com o nome de atualizar já que o codigo pros dois seria literalmente o mesmo)
    }), [user, isLoading, login, logout, loadSession])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> //devolve as informações caso seja necessario, e devolve os filhos do componente AuthProvider (achei melhor fazer armazenar na memoria com o useMemo porque isso roda literalmente em cada renderização do app, ao guardar em cache ele so roda caso eu troque as informações dele)
}
