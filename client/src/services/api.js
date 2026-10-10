//bilioteca para eu fazer requisição em geral tipo put, delete e etc
import axios from 'axios';
//biblioteca para dar um aviso caso algo de errado na verificação aqui
import { globalApiErrorToast } from './toastManager.jsx';

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
            if (error.config?.skipGlobalErrorToast) { //(esqueci de comentar) se essa variavel for true ele não mostra nenhum toast
                return Promise.reject(error)
            }

            if (error.response?.status === 401) {
                window.dispatchEvent(new Event('auth:expired'));
            }else {
                globalApiErrorToast(error)
            }

            return Promise.reject(error); //exporta para tratar o erro em outro lugar caso necessario
    }
);

export default api;
