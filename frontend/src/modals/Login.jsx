import React, { useState } from "react";
import axios from "axios";

import { useAuth } from '../services/AuthProvider';

const Login = ({ setToken }) => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/auth/jwt/create", credentials);
            const {access, refresh} = response.data;
            login(access, refresh)
            setMessage("Pomyślnie zalogowano");
        } catch (error) {
            setMessage("Nieprawidłowa nazwa uzytkownika lub hasło. Spróbuj ponownie.");
        }
    };

    return (
        <div>
            <h2>Logowanie</h2>
            <form onSubmit={handleSubmit}>
                <div className="loginForm">
                    <div>
                        <label>Nazwa uzytkownika:</label>
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
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;