import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ScenarioList.css';


const ScenarioList = ({ scenarios, onScenarioSelect, onDeleteScenario }) => {
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
                        <div className="butons">
                            <button className="select" onClick={() => onScenarioSelect(scenario)}>Zadania</button>
                            <button className="delete" onClick={() => onDeleteScenario(scenario.id)}>Usuń Scenariusz</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScenarioList;
