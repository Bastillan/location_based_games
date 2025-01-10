import React, { useState } from "react";
import api from '../services/api'


const RegisterForm = ( {closeForm} ) => {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setErrors({});
        try {
            const response = await api.post("/auth/users/", formData);

            const loginResponse = await api.post("/auth/jwt/create/", {
                username: formData.username,
                password: formData.password,
            });

            const token = loginResponse.data.access;

            await api.post(
                "/api/user-profile/",
                {},
                {
                    headers: {
                        Authorization: `JWT ${token}`,
                    },
                }
            );

            setMessage("Pomyślnie zarejestrowano.");
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            }
            else {
                setMessage("Wystąpił błąd. Spróbuj ponownie.");
            }
        }
    };

    return (
        <div className='overlay'>
            <div className='modal'>
                <h2>Rejestracja</h2>
                <form onSubmit={handleSubmit}>
                    <div className="loginForm">
                        <div>
                            <label>Nazwa użytkownika:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            {errors.username && <p className="error">{errors.username}</p>}
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && <p className="error">{errors.email}</p>}
                        </div>
                        <div>
                            <label>Hasło:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            {errors.password && <p className="error">{errors.password}</p>}
                        </div>
                    </div>
                    <button type="submit" className="mainBut">Zarejestruj się</button>
                </form>
                {message && <p>{message}</p>}
                <button className='mainBut' onClick={closeForm}>Zamknij</button>
            </div>
        </div>
    );
};

export default RegisterForm;
