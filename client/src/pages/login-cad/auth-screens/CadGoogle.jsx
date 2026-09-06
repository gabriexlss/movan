import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../../services/api'
import { useAuth } from '../../../context/useAuth'
import './AuthScreens.css'

const CadGoogle = () => {
    const navigate = useNavigate() //me deixa mandar o usuario para outra pagina
    const { refreshSession } = useAuth() //uso para atualizar a sessão do usuario
    
    const [dadosGoogle] = useState(() => { //função que pega os dados que guardei no sessionStorage
        try {
            return JSON.parse(sessionStorage.getItem('movan:googleSignup')) //tento pegar os dados no sessionStorage
        } catch {
            return null //se der erro eu devolvo null
        }
    })
    const [cnpj, setCnpj] = useState('') //CNPJ do usuário
    const [senha, setSenha] = useState('') //senha do usuário
    const [confirmarSenha, setConfirmarSenha] = useState('') //senha de confirmação do usuário
    const [enviando, setEnviando] = useState(false) //essa variavel fala se o formulario esta no processo de envio

    //=======================
    //CADASTRO COM GOOGLE
    //=======================
    const handleSubmit = async (event) => { //chamo essa função quando o botão é clicado
        event.preventDefault() //não deixa a pagina recarregar

        if (senha !== confirmarSenha) { //verifico se as senhas são diferentes
            toast.error('As senhas precisam ser iguais.') //se forem diferentes mando esse erro
            return //cancelo o envio do formulario
        }

        if (!dadosGoogle?.token || !dadosGoogle?.nome) { //verifico se os dados foram mandados
            toast.error('Não foi possível recuperar os dados da conta Google.') //se não foram mando um erro
            navigate('/cadastro', { replace: true }) //jogo o usuario para o cadastro padrão
            return //cancelo o envio do formulario
        }

        setEnviando(true) //digo que o formulario iniciou o envio

        try {
            const response = await api.post('/motorista/google/criar', { //envio os seguintes dados para o backend
                nome: dadosGoogle.nome, //o nome do usuario que o google me devolveu
                cnpj: cnpj.replace(/\D/g, ''), //deixo so os numeros do CNPJ e mando pro backend
                senha, //a senha do usuario
                token: dadosGoogle.token, //o token do google
            }, {
                skipGlobalErrorToast: true, //tratarei erros aqui então impeço que o toast global de erro seja chamado
            })
            sessionStorage.removeItem('movan:googleSignup') //removo os dados do sessionStorage
            await refreshSession() //atualizo a sessão do usuario para logar
            toast.success(response.data?.msg || 'Conta criada com sucesso.') //mando uma mensagem de sucesso do backend caso ela não exista mando uma mensagem generica
            navigate('/', { replace: true }) //mando o usuario para a tela inicial
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error(error.response.data?.msg || 'E-mail, CNPJ ou conta Google já cadastrado no Movan.')
                return
            }

            const errosDeCampo = Object.values(error.response?.data?.erro || {}) //transformo o erro do backend em um array, caso ele não mande nada o array fica vazio
                .flatMap((campo) => campo?._errors || []) //tiro o _errors de cada campo e coloco tudo em um array só
            const mensagem = errosDeCampo.join(' ') || error.response?.data?.msg || 'Não foi possível criar sua conta Google.' //se o backend mandou algo eu uso, caso não eu mando uma mensagem de erro generica
            toast.error(mensagem) //manda a mensagem
        } finally {
            setEnviando(false) //digo que o envio do formulario acabou
        }
    }

    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Cadastro com google</h2>

            <form
                className="auth-screens__form"
                onSubmit={handleSubmit}
            >
                <div className="auth-screens__campo">
                    <input
                        type="text"
                        id="cnpjGoogle"
                        name="cnpj"
                        value={cnpj}
                        onChange={(event) => setCnpj(event.target.value)}
                        placeholder=" "
                        inputMode="numeric"
                        maxLength={18}
                        required
                    />
                    <label htmlFor="cnpjGoogle">CNPJ</label>
                </div>

                <div className="auth-screens__campo">
                    <input
                        type="password"
                        id="senhaGoogle"
                        name="senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        required
                        
                    />
                    <label htmlFor="senhaGoogle">Senha</label>
                </div>

                <div className="auth-screens__campo">
                    <input
                        type="password"
                        id='confirmarSenhaGoogle'
                        name='confirmarSenha'
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        placeholder=' '
                        autoComplete='new-password'
                        required
                    />
                    <label htmlFor="confirmarSenhaGoogle">Confirmar senha</label>
                </div>

                <button className="auth-screens__botao" type="submit" disabled={enviando}>
                    {enviando ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>
        </section>
    )
}

export default CadGoogle
