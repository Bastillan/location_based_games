import '../styles/ScenarioList.css';
import ConfirmForm from '../modals/ConfirmForm';
import { useState } from 'react';

// Used for displaying list of scenarios
const ScenarioList = ({ scenarios, onScenarioSelect, onDeleteScenario, onEditScenario, onActivateGame }) => {
    const [isDeleteScenarioFormVisible, setIsDeleteScenarioFormVisible] = useState(false);

    return (
        <div>
            <h1>Scenariusze</h1>
            <div className="scenariosList">
                {scenarios.map((scenario) => (
                    <div className="scenarioItem" key={scenario.id}>
                        <h3>{scenario.title}</h3>
                        <p>{scenario.description}</p>
                        {scenario.image && (
                            <img src={scenario.image} alt={scenario.title} style={{ width: '100%' }} />
                        )}
                        <div className="buttons">
                            <button className="activate" onClick={() => onActivateGame(scenario)}>Aktywuj grę</button>
                            <button className="select" onClick={() => onScenarioSelect(scenario)}>Zadania</button>
                            <button className="edit" onClick={() => onEditScenario(scenario)}>Edytuj</button>
                            <button className="delete" onClick={() => setIsDeleteScenarioFormVisible(true)}>Usuń</button>
                        </div>
                        {isDeleteScenarioFormVisible && (
                            <ConfirmForm
                                text="Czy na pewno chcesz usunąć ten scenariusz?"
                                onConfirm={() => onDeleteScenario(scenario.id)}
                                onClose={() => setIsDeleteScenarioFormVisible(false)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScenarioList;
