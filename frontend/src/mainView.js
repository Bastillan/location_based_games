import React, { useState, useEffect } from "react";
import axios from "axios";
import Register from "./Register";
import Login from "./Login";
import App from './App';
import TasksPlayList from './TasksPlayList';
import './mainView.css';

const MainView = () => {
    const [isRegisterFormVisible, setIsRegisterFormVisible] = useState(false);
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('authToken') || null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [tasks, setTasks] = useState([]);

    const openRegisterForm = () => {
        setIsRegisterFormVisible(true);
    };

    const closeRegisterForm = () => {
        setIsRegisterFormVisible(false);
    };

    const openLoginForm = () => setIsLoginFormVisible(true);
    const closeLoginForm = () => setIsLoginFormVisible(false);

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('authToken');
    };

    const handleAdminClick = () => {
        setIsAdmin(true);
    };

    const handleAdminReturn = () => {
        setIsAdmin(false);
        fetchGames();
    };

    const fetchGames = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/games/");
            setGames(response.data);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    const fetchTasks = async (scenarioId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/tasks/?scenario=${scenarioId}`);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const onGameSelect = (game) => {
        setSelectedGame(game);

        fetchTasks(game.scenario.id);
    };

    const handleBackToGamesList = () => {
        setSelectedGame(null);
    };

    useEffect(() => {
        fetchGames();
    }, []);

    return (
        <div className="main">
            {!isAdmin ? (
                <div>
                    {selectedGame ? (
                        <TasksPlayList tasks={tasks} handleBackToGamesList={handleBackToGamesList} />
                    ) : (
                    <div>
                        <nav className="logNav">
                            {token ? (
                                <button className="mainBut logout" onClick={handleLogout}>Wyloguj się</button>
                            ) : (
                                <>
                                    <button className="mainBut register" onClick={openRegisterForm}>Zarejestruj się</button>
                                    <button className="mainBut login" onClick={openLoginForm}>Zaloguj się</button>
                                </>
                            )}
                        </nav>
                        <button onClick={handleAdminClick} style={{ margin: '10px', padding: '10px' }}>
                            Admin
                        </button>
                        <header className="header">
                            <h1>Platforma do Gier Miejskich</h1>
                            <p>Witamy na naszej platformie. Zaloguj się lub zarejestruj, aby rozpocząć grę!</p>
                        </header>
                        <main>
                            <div className="gamesView">
                                <h2>Lista Gier</h2>
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
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            {isRegisterFormVisible && (
                                <>
                                    <div className="overlay"></div>
                                    <div className="modal">
                                        <Register />
                                        <button className="mainBut" onClick={closeRegisterForm}>Zamknij</button>
                                    </div>
                                </>
                            )}
                            {isLoginFormVisible && (
                                <>
                                    <div className="overlay"></div>
                                    <div className="modal">
                                        <Login setToken={setToken} />
                                        <button className="mainBut" onClick={closeLoginForm}>Zamknij</button>
                                    </div>
                                </>
                            )}
                        </main>
                    </div>)}
                </div>
            ) : (
                <div>
                    <button onClick={handleAdminReturn} style={{ margin: '10px', padding: '10px' }}>
                        MainView
                    </button>
                    <App />
                </div>
            )}
        </div>
    );
};

export default MainView;
