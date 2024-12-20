import React, { useState, useEffect } from "react";
import axios from "axios";
import Register from "./Register";
import Login from "./Login";
import './main.css';

const MainView = () => {
    const [isRegisterFormVisible, setIsRegisterFormVisible] = useState(false);
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);
    const [isGamesListVisible, setIsGamesListVisible] = useState(false);
    const [games, setGames] = useState([]);

    const openRegisterForm = () => setIsRegisterFormVisible(true);
    const closeRegisterForm = () => setIsRegisterFormVisible(false);

    const openLoginForm = () => setIsLoginFormVisible(true);
    const closeLoginForm = () => setIsLoginFormVisible(false);

    const openGamesList = () => {
        setIsGamesListVisible(true);
        fetchGames();
    };

    const closeGamesList = () => setIsGamesListVisible(false);

    const fetchGames = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/games/");
            setGames(response.data);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    return (
        <div className="main">
            <header className="header">
                <h1>Platforma do Gier</h1>
                <p>Witamy na naszej platformie. Zaloguj się lub zarejestruj, aby rozpocząć grę!</p>
            </header>
            <nav className="nav">
                <button className="mainBut" onClick={openGamesList}>
                    Zobacz Gry
                </button>
                <button className="mainBut" onClick={openRegisterForm}>
                    Rejestracja
                </button>
                <button className="mainBut" onClick={openLoginForm}>
                    Logowanie
                </button>
            </nav>
            <main>
                {isGamesListVisible && (
                    <div className="gamesView">
                        <button className="mainBut" onClick={closeGamesList}>
                            Powrót
                        </button>
                        <h2>Lista Gier</h2>
                        <ul>
                            {games.map((game) => (
                                <li key={game.id}>
                                    <h3>{game.title}</h3>
                                    <p>{game.scenario.description}</p>
                                    {game.scenario.image && (
                                        <img
                                            src={game.scenario.image}
                                            alt={game.scenario.title}
                                            style={{ width: "300px" }}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {isRegisterFormVisible && (
                    <>
                        <div className="overlay"></div>
                        <div className="modal">
                            <Register />
                            <button className="mainBut" onClick={closeRegisterForm}>
                                Zamknij
                            </button>
                        </div>
                    </>
                )}
                {isLoginFormVisible && (
                    <>
                        <div className="overlay"></div>
                        <div className="modal">
                            <Login />
                            <button className="mainBut" onClick={closeLoginForm}>
                                Zamknij
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default MainView;
