import { useAuth } from '../services/AuthProvider';
import { Navigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";

import api from '../services/api';

// Used for displaying home page
const Home = () => {
    const { user } = useAuth();
    const [games, setGames] = useState([]);

    // Fetch game list from API
    const fetchGames = async () => {
        try {
            const response = await api.get("/api/games/");
            setGames(response.data);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    useEffect(() => {
            fetchGames();
        }, []);

    return (
        <div>
            {!user ? (
                <div>
                    <h1>Platforma do Gier Miejskich</h1>
                    <p>Witamy na naszej platformie. Zaloguj się lub zarejestruj, aby dołączyć do gry!</p>
                    <div className="gamesView">
                        <h2>Lista Dostępnych Gier</h2>
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
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <h1>Witaj {user.username}</h1>
            )}
            {user && user.is_staff && (
                <Navigate to="/admin" />
            )}
            {user && !user.is_staff && (
                <Navigate to="/user" />
            )}
        </div>
    )
}

export default Home;