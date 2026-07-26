import React from 'react'
import './header.css'

import stain from '../assets/media/img/header-stain.svg'

const header = () => {

return (
    <div className='header'>
        <img src={stain} alt="Stain" className='stain'/>

        <div className='texto-titulo'>
            <h1 id='movan'>MO<span id='movan-span'>VAN</span></h1>
            <p id='subtitulo'>Seu caminho seguro na <br/> palma da mão</p>
        </div>

    </div>
)

}

export default header