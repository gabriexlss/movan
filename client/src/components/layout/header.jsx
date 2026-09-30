import styles from './header.module.css'
import { useLayoutEffect, useRef } from 'react'

import useHeaderScroll from '../../hook/useHeaderScroll'

const Header = () => {
    const showHeader = useHeaderScroll();
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

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA EU NÃO AGUENTO MAAAAAAAIS

return (
    <header ref={headerRef} className={`${styles.header} ${showHeader ? '' : styles.hidden}`}>

        <div className={styles['texto-titulo']}>
            <h1 className={styles.movan}>MO<span className={styles['movan-span']}>VAN</span></h1>
            <p className={styles.subtitulo}>Seu caminho seguro na <br/> palma da mão</p>
        </div>

    </header>
)

}

export default Header
