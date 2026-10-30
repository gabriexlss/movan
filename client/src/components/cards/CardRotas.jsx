import { useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { RiGraduationCapLine } from 'react-icons/ri'

import DefaultCard from './DefaultCard'
import styles from './CardRotas.module.css'

const rotas = [
    [
        { nome: 'Etec J.A', horario: 'manhã' },
        { nome: 'Etec J.A', horario: 'manhã' },
        { nome: 'Etec J.A', horario: 'manhã' },
    ],
    [
        { nome: 'Colégio Central', horario: 'tarde' },
        { nome: 'Escola Modelo', horario: 'tarde' },
        { nome: 'Etec J.A', horario: 'noite' },
    ],
]

const CardRotas = () => {
    const [pagina, setPagina] = useState(0)
    const escolas = rotas[pagina]

    return (
        <DefaultCard
            title="Rotas diárias"
            link="/rota"
            linkLabel="Ver rotas no mapa"
            headerContent={(
                <nav className={styles.paginacao} aria-label="Páginas de rotas diárias">
                    <button
                        type="button"
                        aria-label="Página anterior"
                        disabled={pagina === 0}
                        onClick={() => setPagina((paginaAtual) => paginaAtual - 1)}
                    >
                        <FaChevronLeft aria-hidden="true" />
                    </button>
                    <span aria-live="polite">{pagina + 1}</span>
                    <button
                        type="button"
                        aria-label="Próxima página"
                        disabled={pagina + 1 >= rotas.length}
                        onClick={() => setPagina((paginaAtual) => paginaAtual + 1)}
                    >
                        <FaChevronRight aria-hidden="true" />
                    </button>
                </nav>
            )}
        >
            <div className={styles.containerEscolas}>
                {escolas.map((escola, indice) => (
                    <div className={styles.escola} key={`${escola.nome}-${escola.horario}-${indice}`}>
                        <RiGraduationCapLine className={styles.iconEscola} aria-hidden="true" />

                        <div className={styles.textoEscola}>
                            <p>{escola.nome}</p>
                            <span>horário: {escola.horario}</span>
                        </div>
                    </div>
                ))}
            </div>
        </DefaultCard>
    )
}

export default CardRotas
