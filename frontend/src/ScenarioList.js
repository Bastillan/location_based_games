import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ScenarioList.css';


const ScenarioList = ({ scenarios, onScenarioSelect, onDeleteScenario, onEditScenario, onActivateGame }) => {
    return (
        <div>
            <h1>Scenariusze</h1>
            <ul>
                {scenarios.map((scenario) => (
                    <li key={scenario.id}>
                        <h3>{scenario.title}</h3>
                        <p>{scenario.description}</p>
                        {scenario.image && (
                            <img src={scenario.image} alt={scenario.title} style={{ width: '500px' }} />
                        )}
                        <div className="buttons">
                            <button className="activate" onClick={() => onActivateGame(scenario)}>Aktywuj grę</button>
                            <button className="select" onClick={() => onScenarioSelect(scenario)}>Zadania</button>
                            <button className="edit" onClick={() => onEditScenario(scenario)}>Edytuj</button>
                            <button className="delete" onClick={() => onDeleteScenario(scenario.id)}>Usuń</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScenarioList;
