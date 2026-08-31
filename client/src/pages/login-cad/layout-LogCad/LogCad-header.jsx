import './LogCad-header.css'

const LogCadHeader = ({ modo }) => {
    return (
        <div className={`LogCad-header-container ${modo}`}>
            <h1 className="titulo-header">MO<span className={`titulo-header2 ${modo}`}>VAN</span></h1>
            <p className="subtitulo-logCad">Seu caminho mais seguro<br/>na palma da sua mão</p>
        </div>
    )
}

export default LogCadHeader
