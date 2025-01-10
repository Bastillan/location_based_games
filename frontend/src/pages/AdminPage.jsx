import {useState, useEffect} from 'react';
import TaskForm from '../modals/TaskForm';
import ScenarioForm from '../modals/ScenarioForm';
import ScenarioList from '../components/ScenarioList';
import GameForm from '../modals/GameForm';
import MailForm from '../modals/MailForm';
import api from '../services/api'; // if api key should be attached to the api request replace axios with api

const AdminPage = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
    const [isScenarioFormVisible, setIsScenarioFormVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [isGamesListVisible, setIsGamesListVisible] = useState(true);
    const [isGameFormVisible, setIsGameFormVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [scenarioToEdit, setScenarioToEdit] = useState(null);
    const [scenarioForGame, setScenarioForGame] = useState(null);
    const [selectedGameIdForEmail, setSelectedGameIdForEmail] = useState(null);
    const [emailStatus, setEmailStatus] = useState('');


    // Fetch scenarios from API
    const fetchScenarios = async () => {
        try {
            const response = await api.get('/api/scenarios/');
            setScenarios(response.data);
        } catch (error) {
            console.error("Error fetching scenarios:", error);
        }
    };

    // Fetch tasks for a specific scenario
    const fetchTasks = async (scenarioId) => {
        try {
            const response = await api.get(`/api/tasks/?scenario=${scenarioId}`);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchGames = async () => {
        try {
            const response = await api.get('/api/games/');
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
            await api.delete(`/api/scenarios/${scenarioId}/`);
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
            await api.delete(`/api/tasks/${taskId}/`);
            fetchTasks(selectedScenario.id);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleDeleteGame = async (gameId) => {
        try {
            await api.delete(`/api/games/${gameId}/`);
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

    const openMailForm = (gameId) => {
        setSelectedGameIdForEmail(gameId);
    };
    
    const handleSendEmail = async (gameId, subject, message) => {
        const emailData = {
            subject,
            message,
            game_id: gameId,
        };
    
        try {
            const response = await api.post('/api/send-email/', emailData);
            if (response.status === 200) {
                setEmailStatus('Emails sent successfully!');
            }
        } catch (error) {
            setEmailStatus('Failed to send emails: ' + error.message);
        }
    };

    const closeEmailForm = async () => {
        setSelectedGameIdForEmail(null);
        setEmailStatus('');
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
                        <TaskForm selectedScenario={selectedScenario} refreshScenarios={refreshScenariosAndTasks} closeForm={closeTaskForm}  taskToEdit={selectedTask}/>
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
                                                <button className="mainBut" onClick={() => openMailForm(game.id)}>
                                                    Wyślij e-maile
                                                </button>
                                            </div>
                                            <button className="mainBut" onClick={() => handleDeleteGame(game.id)}>Usuń</button>
                                        </div>
                                    )
                                })}
                            </div>
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
            {selectedGameIdForEmail && (
                <MailForm
                    gameId={selectedGameIdForEmail}
                    emailStatus={emailStatus}
                    onClose={closeEmailForm}
                    onSend={handleSendEmail}
                />
            )}
        </div>
    );
};

export default AdminPage;

