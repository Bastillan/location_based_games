import React, { useState } from "react";
import axios from "axios";

const Register = () => {
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
            const response = await axios.post("http://localhost:8000/auth/users/", formData);
            setMessage("Pomyślnie zarejestrowano");
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
        <div>
            <h2>Rejestracja</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nazwa użytkownika:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
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
                </div>
                <button type="submit" class="mainBut">Zarejestruj się</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;
