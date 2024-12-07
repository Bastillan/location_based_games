import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import ScenarioForm from './ScenarioForm';
import ScenarioList from './ScenarioList';

const App = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [tasks, setTasks] = useState([]); // To store tasks for the selected scenario
    const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
    const [isScenarioFormVisible, setIsScenarioFormVisible] = useState(false);


    // const [updateTrigger, setUpdateTrigger] = useState(false);
    // const refreshTasks = () => {
    //     setUpdateTrigger(!updateTrigger);
    // };

    // Fetch scenarios from API
    const fetchScenarios = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/scenarios/');
            setScenarios(response.data);
        } catch (error) {
            console.error("Error fetching scenarios:", error);
        }
    };

    // Fetch tasks for a specific scenario
    const fetchTasks = async (scenarioId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/tasks/?scenario=${scenarioId}`);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchScenarios();
    }, []);

    // Handle scenario selection
    const handleScenarioSelect = (scenario) => {
        setSelectedScenario(scenario);
        fetchTasks(scenario.id); // Fetch tasks for the selected scenario
    };

    const handleDeleteScenario = async (scenarioId) => {
        try {
            await axios.delete(`http://localhost:8000/api/scenarios/${scenarioId}/`);
            fetchScenarios();
            if (selectedScenario?.id === scenarioId) {
                setSelectedScenario(null);
                setTasks([]);
                setIsTaskFormVisible(false);
            }
        } catch (error) {
            console.error("Error deleting scenario:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:8000/api/tasks/${taskId}/`);
            fetchTasks(selectedScenario.id);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // Refresh scenarios and tasks after adding a scenario or task
    const refreshScenariosAndTasks = () => {
        fetchScenarios();
        if (selectedScenario) {
            fetchTasks(selectedScenario.id); // Refresh tasks for the selected scenario
        }
    };

    const handleBackToList = () => {
        setSelectedScenario(null);
        setIsTaskFormVisible(false); // Hide task form
    };

    const closeScriptForm = () => {
        setIsScenarioFormVisible(false);
    };

    const closeTasktForm = () => {
        setIsTaskFormVisible(false);
    };

    const openScenarioForm = () => {
        setIsScenarioFormVisible(true);
    };

    // Show the task form modal
    const openTaskForm = () => {
        setIsTaskFormVisible(true);
    };

    return (
        <div className="main">
            {selectedScenario ? (
                <div className="scenarioView">
                    <button className="powrot" onClick={handleBackToList}>Wróć do scenariuszy</button>
                    <h3>{selectedScenario.title}</h3>
                    <p>{selectedScenario.description}</p>
                    {selectedScenario.image && (
                        <img src={selectedScenario.image} alt={selectedScenario.title} style={{ width: '500px' }} />
                    )}
                    <h3>Zadania do scenariusza:</h3>
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id}>
                                <h4>zadanie {task.number}</h4>
                                <p>{task.description}</p>
                                {task.image && (
                                    <img
                                        src={task.image}
                                        alt="Task"
                                        style={{ width: '500px' }}
                                    />
                                )}
                                {task.audio && (
                                    <audio controls>
                                        <source src={task.audio} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                                <button onClick={() => handleDeleteTask(task.id)}>Usuń</button>
                            </li>
                        ))}
                    </ul>
                    {isTaskFormVisible ? (
                        <>
                            <div className="overlay"></div>
                            <div className="modal">
                                <TaskForm selectedScenario={selectedScenario} refreshScenarios={refreshScenariosAndTasks} closeForm={closeTasktForm} />
                                <button onClick={closeTasktForm}>Zamknij</button>
                            </div>
                            
                        </>
                    ) : (
                        <div>
                            <button className="addTask" onClick={openTaskForm}>+</button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {isScenarioFormVisible && (
                        <>
                            <div className="overlay"></div>
                            <div className="modal">
                                <ScenarioForm refreshScenarios={refreshScenariosAndTasks} closeForm={closeScriptForm} />
                                <button onClick={closeScriptForm}>Zamknij</button>
                            </div>
                        </>
                    )}
                    {/* <ScenarioForm refreshScenarios={refreshScenariosAndTasks} /> */}
                    <ScenarioList scenarios={scenarios} onScenarioSelect={handleScenarioSelect} onDeleteScenario={handleDeleteScenario} />
                    <button className="addScenario" onClick={openScenarioForm}>+</button>
                </div>
            )}
        </div>
    );
};

export default App;
