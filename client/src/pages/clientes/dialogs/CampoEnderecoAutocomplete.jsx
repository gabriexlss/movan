import { useEffect, useId, useRef, useState } from 'react'

import { carregarGooglePlaces } from '../../../services/googlePlaces'
import styles from './dialogsClientes.module.css'

const CampoEnderecoAutocomplete = ({ icon, value, onChange, onSelecionar }) => {
    const fieldId = useId()
    const [sugestoes, setSugestoes] = useState([])
    const [erro, setErro] = useState('')
    const bibliotecaPlaces = useRef(null)
    const tokenSessao = useRef(null)
    const requisicaoAtual = useRef(0)
    const espera = useRef(null)

    useEffect(() => {
        let ativo = true  //uso essa variavel para ver se o componente ta montado ainda

        carregarGooglePlaces()  //chamo a função que carrega a biblioteca do google places
            .then((maps) => maps.importLibrary('places')) //peço para importar a biblioteca de places
            .then((places) => { //quando a biblioteca for importada
                if (!ativo) return //se o componente não estiver montado, não faço nada

                bibliotecaPlaces.current = places //guardo a biblioteca de places no ref
                tokenSessao.current = new places.AutocompleteSessionToken() //crio um token de sessão para o autocomplete, que é usado para agrupar as requisições de autocomplete e melhorar a precisão das sugestões
            })
            .catch((error) => { //se der algum erro
                if (ativo) setErro(error.message) //mostro o erro na tela se o componente ainda estiver montado
            })

        return () => { //quando o componente for desmontado
            ativo = false //falo que o componente não está mais montado
            clearTimeout(espera.current) //limpo o timeout que estava esperando para buscar as sugestões
        }
    }, [])

    const buscarSugestoes = (endereco) => { //função para buscar sugestões de endereço
        onChange(endereco) //chamo a função que foi passada como prop para atualizar o valor do campo
        setErro('') //limpo o erro que estava sendo mostrado
        clearTimeout(espera.current) //limpo o timeout que estava esperando para buscar as sugestões

        if (endereco.trim().length < 3 || !bibliotecaPlaces.current) { //se o endereço tiver menos de 3 caracteres ou a biblioteca de places não estiver carregada
            setSugestoes([]) //limpo as sugestões que estavam sendo mostradas
            return
        }

        espera.current = setTimeout(async () => { //uso um timeout para esperar 250ms  antes de buscar as sugestões, assim não faço requisições a cada letra digitada
            const idRequisicao = ++requisicaoAtual.current //guardo o id da requisição atual para saber se a resposta que chegar é da ultima requisição feita

            try {
                const { AutocompleteSuggestion } = bibliotecaPlaces.current //pego a classe AutocompleteSuggestion da biblioteca de places
                const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ //chamo a função que busca as sugestões de endereço
                    input: endereco, //passo o endereço que foi digitado para a api
                    includedRegionCodes: ['br'], //falo que so quero sugestões de endereços do brasil
                    language: 'pt-BR', //falo que quero as sugestões em português do brasil
                    region: 'br', //falo que a região que quero as sugestões é o brasil
                    sessionToken: tokenSessao.current, //passo o token de sessão que foi criado quando o componente foi montado, para agrupar as requisições de autocomplete e melhorar a precisão das sugestões
                })

                if (idRequisicao === requisicaoAtual.current) { //se a resposta que chegou for da ultima requisição feita, atualizo as sugestões que estão sendo mostradas
                    setSugestoes(suggestions.filter((sugestao) => sugestao.placePrediction)) //filtro as sugestões que não possuem placePrediction, pois essas não são endereços válidos
                }
            } catch { //se der algum erro na requisição
                if (idRequisicao === requisicaoAtual.current) { //se a resposta que chegou for da ultima requisição feita, mostro o erro na tela
                    setErro('Não foi possível buscar os endereços agora. Tente novamente.') //falo que não foi possível buscar os endereços agora e peço para tentar novamente
                }
            }
        }, 250) //seto o timeout para 250ms, assim não faço requisições a cada letra digitada
    }

    const selecionarEndereco = async (previsao) => { //função para quando o usuario selecionar um endereço da lista de sugestões
        setSugestoes([]) //limpo as sugestões que estavam sendo mostradas
        setErro('') //limpo o erro que estava sendo mostrado

        try {
            const local = previsao.toPlace() //pego o local que foi selecionado pelo usuario
            await local.fetchFields({ fields: ['formattedAddress', 'location'] }) //pego o endereço formatado e as cordenadas do local selecionado, que são os campos que o backend espera receber

            if (!local.location) { //se o local não tiver localização
                throw new Error('O endereço selecionado não possui coordenadas.') //mando um erro dizendo que o endereço selecionado não possui coordenadas
            }

            onSelecionar({ //chamo a função de seleção
                endereco: local.formattedAddress || previsao.text.toString(), //pego o endereço formatado do local selecionado, se não tiver, pego o texto da previsão que foi selecionada
                latitude: local.location.lat(), //pego a latitude do local selecionado
                longitude: local.location.lng(), //pego a longitude do local selecionado
            })

            tokenSessao.current = new bibliotecaPlaces.current.AutocompleteSessionToken() //quando o usuario seleciona um endereço, crio um novo token de sessão para o autocomplete, para que as próximas requisições de autocomplete não sejam afetadas pelo endereço que foi selecionado
        } catch (error) {
            setErro(error.message || 'Não foi possível obter as coordenadas desse endereço.') //mostro o erro na tela, se não tiver mensagem de erro, mostro uma mensagem padrão dizendo que não foi possível obter as coordenadas do endereço
        }
    }

    return ( //aqui é o retorno do componente, que é o que vai ser renderizado na tela
        <div className={`${styles.field} ${styles.autocompleteField}`}>
            <label htmlFor={fieldId}>Endereço</label>
            <div className={styles.inputWrapper}>
                <span className={styles.fieldIcon} aria-hidden="true">{icon}</span>
                <input
                    id={fieldId}
                    value={value}
                    onChange={(event) => buscarSugestoes(event.target.value)}
                    onBlur={() => setTimeout(() => setSugestoes([]), 150)}
                    placeholder="Digite e escolha o endereço da escola"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls={`${fieldId}-sugestoes`}
                    aria-expanded={sugestoes.length > 0}
                    required
                />
            </div>

            {sugestoes.length > 0 && (
                <ul id={`${fieldId}-sugestoes`} className={styles.sugestoesEndereco} role="listbox">
                    {sugestoes.map(({ placePrediction }) => (
                        <li key={placePrediction.placeId} role="option" aria-selected="false">
                            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selecionarEndereco(placePrediction)}>
                                <strong>{placePrediction.mainText?.toString()}</strong>
                                <span>{placePrediction.secondaryText?.toString()}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {erro && <p className={styles.autocompleteError} role="alert">{erro}</p>}
        </div>
    )
}

export default CampoEnderecoAutocomplete
