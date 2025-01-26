import React, { useState } from "react";
import api from '../services/api';

import { useAuth } from '../services/AuthProvider';
import { useNavigate } from 'react-router-dom';

// Used for login to application
const LoginForm = ({ closeForm }) => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/auth/jwt/create", credentials);
            const { access, refresh } = response.data;
            login(access, refresh);
            setMessage("Pomyślnie zalogowano");
            navigate('/');
        } catch (error) {
            setMessage("Nieprawidłowa nazwa użytkownika lub hasło. Spróbuj ponownie.");
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("auth/users/reset_password/", { email: resetEmail });
            setMessage("Link do resetowania hasła został wysłany na podany adres e-mail.");
            setShowResetPassword(false); // Return to login form
        } catch (error) {
            setMessage("Nie udało się wysłać linku do resetowania hasła. Sprawdź poprawność adresu e-mail.");
        }
    };

    return (
        <div className='overlay'>
            <div className='modal'>
                <h2>{showResetPassword ? "Resetowanie Hasła" : "Logowanie"}</h2>
                {showResetPassword ? (
                    <form onSubmit={handleResetPasswordSubmit}>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className="mainBut" type="submit">Wyślij link resetujący</button>
                        <button
                            className="mainBut"
                            type="button"
                            onClick={() => setShowResetPassword(false)}
                        >
                            Wróć do logowania
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="loginForm">
                            <div>
                                <label>Nazwa użytkownika:</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Hasło:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <button className="mainBut" type="submit">Zaloguj się</button>
                        <p>
                            Zapomniałeś hasła?{" "}
                            <button className="mainBut"
                                type="button"
                                onClick={() => setShowResetPassword(true)}
                            >
                                Zresetuj je tutaj
                            </button>
                        </p>
                    </form>
                )}
                {message && <p>{message}</p>}
                <button className='mainBut' onClick={closeForm}>Zamknij</button>
            </div>
        </div>
    );
};

export default LoginForm;
