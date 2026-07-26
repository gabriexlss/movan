import DefaultCard from './DefaultCard';
import './CardMensali.css';
import { Link } from 'react-router-dom';

const CardMensali = ({ title, children }) => {
    return (
        <DefaultCard title="Mensalidades">
            <div className="containerMensalidades">
                <div className="mensalidade">
                    
                </div>
            </div>
        </DefaultCard>
    );
}

export default CardMensali