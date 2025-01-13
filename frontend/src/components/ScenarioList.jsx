import '../styles/ScenarioList.css';

// Used for displaying list of scenarios
const ScenarioList = ({ scenarios, onScenarioSelect, onDeleteScenario, onEditScenario, onActivateGame }) => {
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
                            <button className="delete" onClick={() => onDeleteScenario(scenario.id)}>Usuń</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScenarioList;
