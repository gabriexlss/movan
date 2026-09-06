import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../../services/api'
import './cad.css'

import ButtonGoogle from '../layout-LogCad/ButtonGoogle'

const Cad = () => {
    const navigate = useNavigate() //manda o usuário para a pagina que quiser
    const [nome, setNome] = useState('') //guarda o nome do usuario
    const [email, setEmail] = useState('') //guarda o email
    const [cnpj, setCnpj] = useState('') //guarda o cnpj do usuario
    const [senha, setSenha] = useState('') //guarda a senha do usuario
    const [confirmarSenha, setConfirmarSenha] = useState('') //guarda a confirmação da senha do usuario
    const [enviando, setEnviando] = useState(false) //uso para falar que o formulario esta sendo enviado

    //==========================
    //CADASTRO
    //==========================
    const handleSubmit = async (event) => { //uso essa função no para enviar os dados do formulario para o backend
        event.preventDefault() //não deixo o navegador atualizar a pagina

        if (senha !== confirmarSenha) { //se a senha e a confirmação de senha forem diferentes
            toast.error('As senhas precisam ser iguais.') //falo que as senhas precissa ser iguais
            return //cancelo o envio do formulario
        }

        setEnviando(true) //falo que o formulario esta sendo enviado

        try {
            const response = await api.post('/motorista', { //aguardo a resposta do backend para criar o usuario
                nome, //mando o nome do usuario
                email, //mando o email do usuario
                cnpj: cnpj.replace(/\D/g, ''), //mando o cnpj do usuario sem os caracteres especiais
                senha, //mando a senha do usuario (não to encriptando a senha pq o backend vai fazer isso)
            }, {
                skipGlobalErrorToast: true, //eu recuso a mensagem de erro do backend que tratei no api.js, porque tratarei ele de forma diferente aqui
            })

            toast.success(response.data?.msg || 'Conta criada com sucesso.') //mando uma caixa de sucesso com a mensagem do backend, caso não tenha mensagem do backend mando uma mensagem padrão
            sessionStorage.setItem('movan:verificationFlow', 'cadastro') //falo que o fluxo de verificação é de cadastro, porque o usuário acabou de criar a conta
            navigate('/codigo-enviado', { replace: true, state: { fluxo: 'cadastro' } }) //mando o usuario para a pagina de codigo enviado
        } catch (error) {
            const errosDeCampo = Object.values(error.response?.data?.erro || {}) //pego os erros do backend e transformo eles em um array de mensagens de erro, caso não tenha erros do backend mando um array vazio
                .flatMap((campo) => campo?._errors || []) //tiro o _errors do campo
            const mensagem = errosDeCampo.join(' ') || error.response?.data?.msg || 'Não foi possível criar sua conta.' //mando a mensagem que tratei do backend, se não tiver mensagem mando uma generica
            toast.error(mensagem)
        } finally {
            setEnviando(false) //falo que o formulario não esta mais sendo enviado
        }
    }

    return(
        <div className="formulario-cad">
            <form onSubmit={handleSubmit}>
                <div className="campo-cadastro">
                    <input
                        type="text"
                        id="nomeCompleto"
                        name="nome"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder=" "
                        autoComplete="name"
                        required
                    />
                    <label htmlFor="nomeCompleto">Nome completo</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="email"
                        id="emailCadastro"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder=" "
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="emailCadastro">E-mail</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="text"
                        id="cnpj"
                        name="cnpj"
                        value={cnpj}
                        onChange={(event) => setCnpj(event.target.value)}
                        placeholder=" "
                        inputMode="numeric"
                        maxLength={18}
                        required
                    />
                    <label htmlFor="cnpj">CNPJ</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="password"
                        id="senhaCadastro"
                        name="senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="senhaCadastro">Senha</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="password"
                        id="confirmarSenha"
                        name="confirmarSenha"
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="confirmarSenha">Confirmar senha</label>
                </div>

                <div className="campo-termos">
                    <input
                        type="checkbox"
                        id="termos"
                        name="termos"
                        required
                    />
                    <label htmlFor="termos">
                        Concordo com os <a href="/termos">termos de uso</a>
                    </label>
                </div>

                <button className="cadastrar" type="submit" disabled={enviando}>
                    {enviando ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>

            <p className="ou">ou</p>

            <ButtonGoogle />
        </div>
    )
}

export default Cad