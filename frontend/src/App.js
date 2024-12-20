import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import ScenarioForm from './ScenarioForm';
import ScenarioList from './ScenarioList';
import GameForm from './GameForm';
import TasksPlayList from './TasksPlayList';
import Register from './Register';
import Login from './Login';
import api from './api'; // if api key should be attached to the api request replace axios with api

const App = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
    const [isScenarioFormVisible, setIsScenarioFormVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [isGamesListVisible, setIsGamesListVisible] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null);
    const [isGameFormVisible, setIsGameFormVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [scenarioToEdit, setScenarioToEdit] = useState(null);
    const [scenarioForGame, setScenarioForGame] = useState(null);

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

    const handleDeleteGame = async (gameId) => {
        try {
            await axios.delete(`http://localhost:8000/api/games/${gameId}/`);
            fetchGames();
        } catch (error) {
            console.error("Error deleting game:", error);
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

    const handleActivateGame = (scenario) => {
        setScenarioForGame(scenario)
        setIsGameFormVisible(true);
    };

    const handleBackToGamesList = () => {
        setSelectedGame(null);
    };
    return (
        <div>
            {selectedScenario ? (
                <div className="scenarioView">
                    <button className="mainBut powrot" onClick={handleBackToList}>Scenariusze</button>
                    <h3>{selectedScenario.title}</h3>
                    <p>{selectedScenario.description}</p>
                    {selectedScenario.image && (
                        <img src={selectedScenario.image} alt={selectedScenario.title} style={{ width: '100%' }} />
                    )}
                    <h3>Zadania do scenariusza:</h3>
                    <div className="tasksList">
                        {tasks.map((task) => (
                            <div className="taskItem" key={task.id}>
                                <h4>Zadanie {task.number}</h4>
                                <p>{task.description}</p>
                                {task.image && (
                                    <img src={task.image} alt="Task" style={{ width: '100%' }} />
                                )}
                                {task.audio && (
                                    <audio controls>
                                        <source src={task.audio} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                                <div className="taskButtons">
                                    <button className="mainBut" onClick={() => handleEditTask(task)}>Edytuj</button>
                                    <button className="mainBut" onClick={() => handleDeleteTask(task.id)}>Usuń</button>
                                </div>
                            </div>
                        ))}
                    </div>
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
                        <div>
                            {selectedGame ? (
                                <TasksPlayList tasks={tasks} handleBackToGamesList={handleBackToGamesList} />
                            ) : (
                                <div className="gamesView">
                                    <button className="mainBut powrot" onClick={handleBackToList}>Scenariusze</button>
                                    <h1>Aktywne gry</h1>
                                    <div className="gamesList">
                                        {games.map((game) => {
                                            const TempBeginningDate = new Date(game.beginning_date);
                                            const TempEndDate = new Date(game.end_date);
                                            const formattedBeginningDate = TempBeginningDate.toLocaleDateString('pl-PL', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            });
                                            const formattedEndDate = TempEndDate.toLocaleDateString('pl-PL', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            });
                                            return(
                                                <div className="gameItem" key={game.id}>
                                                    <h3>{game.title}</h3>
                                                    <p><b>Start:</b> {formattedBeginningDate}</p>
                                                    <p><b>Koniec:</b> {formattedEndDate}</p>
                                                    <p><b>Opis:</b> {game.scenario.description}</p>
                                                    {game.scenario.image && (
                                                        <img src={game.scenario.image} alt={game.scenario.title} style={{ width: '100%' }} />
                                                    )}
                                                    <div className="butons">
                                                        <button className="mainBut select" onClick={() => onGameSelect(game)}>Zagraj</button>
                                                    </div>
                                                    <button className="mainBut" onClick={() => handleDeleteGame(game.id)}>Usuń</button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <button className="mainBut showGames" onClick={openGamesList}>Gry</button>
                            {isScenarioFormVisible && (
                                <>
                                    <div className="overlay"></div>
                                    <div className="modal">
                                        <ScenarioForm refreshScenarios={refreshScenariosAndTasks} closeForm={closeScriptForm} scenarioToEdit={scenarioToEdit} />
                                        <button className="mainBut" onClick={closeScriptForm}>Zamknij</button>
                                    </div>
                                </>
                            )}
                            {isGameFormVisible && (
                                <>
                                    <div className="overlay"></div>
                                    <div className="modal">
                                        <GameForm selectedScenario={scenarioForGame} refreshGames={refreshGames} closeForm={closeGameForm} />
                                        <button className="mainBut" onClick={closeGameForm}>Zamknij</button>
                                    </div>
                                </>
                            )}
                            {/* <ScenarioForm refreshScenarios={refreshScenariosAndTasks} /> */}
                            <ScenarioList scenarios={scenarios} onScenarioSelect={handleScenarioSelect} onDeleteScenario={handleDeleteScenario} onEditScenario={handleEditScenario} onActivateGame={handleActivateGame}/>
                            <button className="mainBut addScenario" onClick={openScenarioForm}>+</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
