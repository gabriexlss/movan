//bilioteca para eu fazer requisição em geral tipo put, delete e etc
import axios from 'axios';
//biblioteca para dar um aviso caso algo de errado na verificação aqui
import { toast } from 'react-hot-toast';

//===========================
//criando a instancia com a url da api do backend
//===========================
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, //url do servidor backend
    timeout: 8000, //tempo limite se passar de 8 segundos é porque algo esta errado
    withCredentials: true, //para mandar o cookie de autenticação junto com a requisição (obrigatório para usar cokies httpOnly)
    headers: {
        'Content-Type': 'application/json', //ele so aceita dados com formato json, se for outro formato ele da erro
    },
})



//===========================
//tratar erros de requisição
//===========================
api.interceptors.response.use(
    (response) => {
        return response, //se o response tiver ok ele manda a resposta sem erro
        (error) => {
            if (error.code === 'ECONNABORTED') {
                toast.error('Tempo de requisição esgotado. Tente novamente mais tarde.'); //caso o tempo passe de 8 segundos manda um aviso com o erro
            }else if (!error.response){
                toast.error('Não foi possivel realizar conexão com o servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.'); // caso o servidor não tenha conseguido mandar uma resposta, avisa esse erro
            }else if (error.response.status === 500) {
                toast.error('Erro interno do servidor. Tente novamente mais tarde.'); //caso o servidor tenha dado erro interno
            }else if (error.response.status === 404) {
                toast.error('Recurso não encontrado.'); //caso o recurso não seja encontrado
            }else if (error.response.status === 403) {
                toast.error('Acesso negado. Você não tem permissão para acessar este recurso.'); //caso o usuário não tenha permissão para acessar o recurso
            }else if (error.response.status === 401) {
                toast.error('Não autorizado. Faça login para acessar este recurso.'); //caso o usuário não esteja logado

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'; //redireciona para a tela de login ja que o servidor deu não autorizado
                }

            }else if (error.response.status === 400) {
                const mensagemBackend = error.response.data?.message || 'Dados inválidos enviados ao servidor.';
                toast.error(`Requisição inválida. ${mensagemBackend}`); //caso o usuário tenha enviado dados inválidos além de falar o erro que de validação do enviado pelo backend (geralmente ocorre quando o backend fala que os dados não estão de acordo)
            }

            return Promise.reject(error); //retorna o erro para que possa ser tratado em outro lugar
        }
    }
);

export default api;