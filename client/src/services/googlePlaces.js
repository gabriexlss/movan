let carregamentoMaps

// A chave é pública no navegador por definição. Restrinja-a no Google Cloud ao
// domínio da aplicação e habilite somente as APIs que este fluxo utiliza.
export const carregarGooglePlaces = () => { //função para fazer o carregameno do Google Places API
    if (window.google?.maps?.importLibrary) { //se a biblioteca estiver carregada
        return Promise.resolve(window.google.maps) //retorno o objeto google.maps
    }

    if (carregamentoMaps) return carregamentoMaps //se já estiver carregando, retorno a promise existente

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY //a chave da API do google maps

    if (!apiKey) { //se nao tiver api key
        return Promise.reject(new Error('A chave da API do Google Maps não foi configurada.')) //recuso a promise e mando um erro
    }

    carregamentoMaps = new Promise((resolve, reject) => { //crio uma promise (basicamente uma função que vai ser resolvida ou rejeitada no futuro) para carregar a biblioteca do Google Maps
        const scriptExistente = document.querySelector('script[data-google-maps-api]') //verifico se já existe um script carregado com a biblioteca do Google Maps

        if (scriptExistente) { //se já existe um script carregado
            scriptExistente.addEventListener('load', () => resolve(window.google.maps), { once: true }) //adiciono um listener para quando o script for carregado, resolvendo a promise com o objeto google.maps
            scriptExistente.addEventListener('error', () => reject(new Error('Não foi possível carregar o Google Maps.')), { once: true }) //adiciono um listener para quando o script falhar ao carregar, rejeitando a promise com um erro
            return
        }

        const callbackName = '__movanGoogleMapsCarregado'
        const limparCallback = () => delete window[callbackName]
        const script = document.createElement('script') //crio um elemento script para guardar coisas do google maps

        // Com loading=async, o Google recomenda usar callback em vez do evento
        // load: ele é chamado somente quando a API está pronta para uso.
        window[callbackName] = () => {
            limparCallback()
            resolve(window.google.maps)
        }

        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${callbackName}` //seto a url do script com a chave da api
        script.async = true //fa com que o script seja carregado de forma assíncrona, ou seja, não bloqueia o carregamento da página
        script.dataset.googleMapsApi = 'true' //adiciono um atributo data-google-maps-api para identificar que o script é do Google Maps
        script.onerror = () => {
            limparCallback()
            reject(new Error('Não foi possível carregar o Google Maps.'))
        } //quando o script falhar ao carregar, rejeito a promise com um erro
        document.head.appendChild(script) //adiciono o script ao head do documento, para que ele seja carregado
    })

    return carregamentoMaps //retorno a promise que vai ser resolvida ou rejeitada no futuro
}
