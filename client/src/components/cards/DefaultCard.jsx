import './DefaultCard.css';

const DefaultCard = ({ title }) => {
    return (
        <section className="card">
            <div className="card-header">{title}</div>
        </section>
    )
}

export default DefaultCard