import './DefaultCard.css';

const DefaultCard = ({ title, children }) => {
    return (
        <section className="card">
            <h1 className="card-header">{title}</h1>
            {children}
        </section>
    )
}

export default DefaultCard