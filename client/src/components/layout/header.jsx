import React from 'react'
import './header.css'
import { useLayoutEffect, useRef } from 'react'

import useHeaderScroll from '../../hook/useHeaderScroll'

import stain from '../../assets/media/img/header-stain.svg'

const Header = () => {
    const headerRef = useRef(null);

// essa constante faz com que a altura do header seja atualizada e seja exportada como variavel pro css
const updateHeaderHeight = () => {
    if (headerRef.current) {
        document.documentElement.style.setProperty(
            "--header-height",
            `${headerRef.current.offsetHeight}px`
        );
    }
};

// essa função aqui é para evitar que a margin do 'tituloTela' não carregue antes de todo o header carregar. sem isso o header inicia com altura 0 e o margin do tituloTela fica também
useLayoutEffect(() => {

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
    });

    if (headerRef.current) {
        resizeObserver.observe(headerRef.current);
    }

    return () => {
        resizeObserver.disconnect();
    };

}, []);
const showHeader = useHeaderScroll();

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA EU NÃO AGUENTO MAAAAAAAIS

return (
    <div ref={headerRef} className={`header ${showHeader ? "" : "hidden"}`}>
        <img src={stain} alt="Stain" className='stain'/>

        <div className='texto-titulo'>
            <h1 id='movan'>MO<span id='movan-span'>VAN</span></h1>
            <p id='subtitulo'>Seu caminho seguro na <br/> palma da mão</p>
        </div>

    </div>
)

}

export default Header