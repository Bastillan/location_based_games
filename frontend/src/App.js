import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import ScenarioForm from './ScenarioForm';
import ScenarioList from './ScenarioList';
import GameForm from './GameForm';

const App = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [tasks, setTasks] = useState([]); // To store tasks for the selected scenario
    const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
    const [isScenarioFormVisible, setIsScenarioFormVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [isGamesListVisible, setIsGamesListVisible] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null);
    const [isGameFormVisible, setIsGameFormVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [scenarioToEdit, setScenarioToEdit] = useState(null);


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

    const fetchGames = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/games/');
            setGames(response.data);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    useEffect(() => {
        fetchScenarios();
        fetchGames();
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

    const handleEditTask = (task) => {
        setSelectedTask(task); // Set the task to be edited
        setIsTaskFormVisible(true); // Show the task form
    };

    const handleEditScenario = (scenario) => {
        setScenarioToEdit(scenario);
        setIsScenarioFormVisible(true); // Pokaż formularz edycji
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
        setIsGamesListVisible(false);
    };

    const closeScriptForm = () => {
        setIsScenarioFormVisible(false);
        setScenarioToEdit(null);
    };

    const closeTaskForm = () => {
        setIsTaskFormVisible(false);
        setSelectedTask(null);
    };

    const openScenarioForm = () => {
        setIsScenarioFormVisible(true);
    };

    // Show the task form modal
    const openTaskForm = () => {
        setIsTaskFormVisible(true);
    };

    const openGamesList = () => {
        setIsGamesListVisible(true);
        fetchGames();
    }

    const onGameSelect = (game) => {
        setSelectedGame(game);

        fetchTasks(game.scenario.id); // Fetch tasks for the selected game
    };

    const refreshGames = () => {
        fetchGames();
    }

    const closeGameForm = () => {
        setIsGameFormVisible(false);
    };

    const openGameForm = () => {
        setIsGameFormVisible(true);
    };

    const activateGame = async (game) => {
        if (!selectedScenario) {
            return;
        }

        const formData = new FormData();
        formData.append('scenario', selectedScenario.id);
        formData.append('title', selectedScenario.title);

        try {
            await axios.post('http://localhost:8000/api/games/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            refreshGames();
        } catch (error) {
            console.error('Error activating game:', error);
        }
    }

    return (
        <div className="main">
            {selectedScenario ? (
                <div className="scenarioView">
                    <button className="mainBut powrot" onClick={handleBackToList}>Wróć do scenariuszy</button>
                    <button className="mainBut activate" onClick={openGameForm}>Aktywuj grę</button>
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
                                <button className="mainBut" onClick={() => handleEditTask(task)}>Edytuj</button>
                                <button className="mainBut" onClick={() => handleDeleteTask(task.id)}>Usuń</button>
                            </li>
                        ))}
                    </ul>
                    {isGameFormVisible ? (
                        <>
                            <div className="overlay"></div>
                            <div className="modal">
                                <GameForm selectedScenario={selectedScenario} refreshGames={refreshGames} closeForm={closeGameForm} />
                                <button className="mainBut" onClick={closeGameForm}>Zamknij</button>
                            </div>

                        </>
                    ) : (<> </>) }

                    {isTaskFormVisible ? (
                        <>
                            <div className="overlay"></div>
                            <div className="modal">
                                <TaskForm selectedScenario={selectedScenario} refreshScenarios={refreshScenariosAndTasks} closeForm={closeTaskForm}  taskToEdit={selectedTask}/>
                                <button className="mainBut" onClick={closeTaskForm}>Zamknij</button>
                            </div>

                        </>
                    ) : (
                        <div>
                            <button className="mainBut addTask" onClick={openTaskForm}>+</button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {isGamesListVisible ? (
                        <div className="gamesView">
                            <button className="mainBut powrot" onClick={handleBackToList}>Wróć do scenariuszy</button>
                            <h1>Aktywne gry</h1>
                            <ul>
                                {games.map((game) => (
                                    <li key={game.id}>
                                        <h3>{game.title}</h3>
                                        <p>{game.beginning_date}</p>
                                        <p>{game.end_date}</p>
                                        <p>{game.scenario.description}</p>
                                        {game.scenario.image && (
                                            <img src={game.scenario.image} alt={game.scenario.title} style={{ width: '500px' }} />
                                        )}
                                        <div className="butons">
                                            <button className="mainBut select" onClick={() => onGameSelect(game)}>Zagraj</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div>
                            {isScenarioFormVisible && (
                                <>
                                    <div className="overlay"></div>
                                    <div className="modal">
                                        <ScenarioForm refreshScenarios={refreshScenariosAndTasks} closeForm={closeScriptForm} scenarioToEdit={scenarioToEdit} />
                                        <button className="mainBut" onClick={closeScriptForm}>Zamknij</button>
                                    </div>
                                </>
                            )}
                            {/* <ScenarioForm refreshScenarios={refreshScenariosAndTasks} /> */}
                            <ScenarioList scenarios={scenarios} onScenarioSelect={handleScenarioSelect} onDeleteScenario={handleDeleteScenario} onEditScenario={handleEditScenario}/>
                            <button className="mainBut addScenario" onClick={openScenarioForm}>+</button>
                            <button className="mainBut showGames" onClick={openGamesList}>Gry</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
