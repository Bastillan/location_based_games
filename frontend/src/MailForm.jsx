import React, { useState } from 'react';

const MailForm = ({ gameId, onClose, onSend }) => {
    const [subject, setSubject] = useState("Game Update");
    const [message, setMessage] = useState("Hello, there is a new update in the game. Please check it out.");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSend(gameId, subject, message);
    };

    return (
        <div className="overlay">
            <div className="modal">
                <h3>Wyślij E-maile</h3>
                <form className="form-container" onSubmit={handleSubmit}>
                    <div>
                        <div><label className="form-label" htmlFor="emailSubject">Temat:</label></div>
                        <input
                            className="form-input"
                            type="text"
                            id="emailSubject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div>
                        <div><label className="form-label" htmlFor="emailMessage">Treść:</label></div>
                        <textarea
                            className="form-input"
                            id="emailMessage"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <button className="mainBut" type="submit">Wyślij</button>
                    <button
                        className="mainBut"
                        type="button"
                        onClick={onClose}
                    >
                        Zamknij
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MailForm;
