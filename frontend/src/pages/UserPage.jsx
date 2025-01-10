import React, { useState, useEffect } from "react";
import TasksPlayList from '../TasksPlayList';
import '../mainView.css';

import api from '../services/api';

const UserPage = () => {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [tasks, setTasks] = useState([]);


    const fetchGames = async () => {
        try {
            const response = await api.get("/api/games/");
            setGames(response.data);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    const fetchTasks = async (scenarioId) => {
        try {
            const response = await api.get(`/api/tasks/?scenario=${scenarioId}`);
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
            {selectedGame ? (
                <TasksPlayList  game={selectedGame} tasks={tasks} handleBackToGamesList={handleBackToGamesList} />
            ) : (
            <div>
                <div className="gamesView">
                    <h2>Lista Gier</h2>
                    <div className="gamesList">
                        {games.filter((game) => {
                            const currentDate = new Date();
                            const gameStartDate = new Date(game.beginning_date);
                            const gameEndDate = new Date(game.end_date);
                            return currentDate >= gameStartDate && currentDate <= gameEndDate;
                        }).map((game) => {
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
            </div>)}
        </div>
    );
};

export default UserPage;
