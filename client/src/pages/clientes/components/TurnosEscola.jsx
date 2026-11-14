import { FaTrash } from 'react-icons/fa'
import { PiPlusBold, PiSunHorizonBold } from 'react-icons/pi'
import CampoCliente from '../dialogs/CampoCliente'
import CampoHorario from './CampoHorario'
import { nomesTurnos } from '../turnos-escola'
import styles from '../dialogs/dialogsClientes.module.css'

const TurnosEscola = ({ turnos, onAdicionar, onAlterar, onRemover, disabled }) => (
    <section className={styles.turnosEscola} aria-label="Turnos da escola">
        <div className={styles.turnosCabecalho}>
            <h3>
                <PiSunHorizonBold aria-hidden="true" />
                Turnos da escola
            </h3>
            <button type="button" className={styles.adicionarTurno} onClick={onAdicionar} disabled={disabled}>
                <PiPlusBold aria-hidden="true" />
                Adicionar turno
            </button>
        </div>
        {turnos.length === 0 && (
            <p className={styles.turnosAviso}>Adicione os turnos e os horários de atendimento da escola, se desejar.</p>
        )}
        {turnos.map((turno, indice) => (
            <fieldset className={styles.turnoItem} key={turno.chave} disabled={disabled}>
                <legend>Turno {indice + 1}</legend>
                <CampoCliente
                    label="Tipo de turno"
                    icon={<PiSunHorizonBold />}
                    as="select"
                    value={turno.turno}
                    onChange={(event) => onAlterar(turno.chave, 'turno', event.target.value)}
                    required
                >
                    {Object.entries(nomesTurnos).map(([valor, nome]) => (
                        <option key={valor} value={valor}>{nome}</option>
                    ))}
                </CampoCliente>
                <div className={styles.horariosTurno}>
                    <CampoHorario
                        label="Entrada"
                        value={turno.horaEntrada}
                        onChange={(horario) => onAlterar(turno.chave, 'horaEntrada', horario)}
                        disabled={disabled}
                        required
                    />
                    <CampoHorario
                        label="Saída"
                        value={turno.horaSaida}
                        onChange={(horario) => onAlterar(turno.chave, 'horaSaida', horario)}
                        disabled={disabled}
                        alinharFim
                        required
                    />
                </div>
                <button
                    type="button"
                    className={styles.removerTurno}
                    onClick={() => onRemover(turno.chave)}
                    aria-label={`Remover turno ${indice + 1}`}
                >
                    <FaTrash aria-hidden="true" />
                    Remover turno
                </button>
            </fieldset>
        ))}
    </section>
)

export default TurnosEscola
