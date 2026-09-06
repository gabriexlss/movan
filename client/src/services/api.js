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
        'Content-Type': 'application/json', //define o formato dos dados enviados para ser apenas JSON
    },
})



//===========================
//tratar erros de requisição
//===========================
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
            if (error.code === 'ECONNABORTED') {
                toast.error('Tempo de requisição esgotado. Tente novamente mais tarde.'); //caso o tempo passe de 8 segundos manda um aviso com o erro
            }else if (!error.response){
                toast.error('Não foi possivel realizar conexão com o servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.'); //informa que não houve resposta do servidor
            }else if (error.response.status === 500) {
                toast.error('Erro interno do servidor. Tente novamente mais tarde.'); //informa um erro interno do servidor
            }else if (error.response.status === 404) {
                toast.error('Recurso não encontrado.'); //informa que o recurso não existe
            }else if (error.response.status === 403) {
                toast.error('Acesso negado. Você não tem permissão para acessar este recurso.'); //informa que o acesso foi negado
            }else if (error.response.status === 401) {
                window.dispatchEvent(new Event('auth:expired'));
            }else if (error.response.status === 400) {
                const mensagemBackend = error.response.data?.message || 'Dados inválidos enviados ao servidor.';
                toast.error(`Requisição inválida. ${mensagemBackend}`); //informa que os dados enviados são inválidos, além de mostrar a mensagem do backend caso exista
            }

            return Promise.reject(error); //exporta para tratar o erro em outro lugar caso necessario
    }
);

export default api;
