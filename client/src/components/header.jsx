import React from 'react'
import './header.css'

import blueStain from '../assets/media/img/header-blue_stain.svg'
import yellowStain from '../assets/media/img/header-yellow_stain.svg'

const header = () => {

return (
    <div className='header'>
        {
            <img src={blueStain} alt="Blue stain" className='blue-stain'/>
        }

        {
            <img src={yellowStain} alt="Yellow stain" className='yellow-stain'/>
        }

        <div className='texto-titulo'>
            <h1 id='movan'>MO<span id='movan-span'>VAN</span></h1>
            <p id='subtitulo'>Seu caminho seguro na <br/> palma da mão</p>
        </div>

    </div>
)

}

export default header