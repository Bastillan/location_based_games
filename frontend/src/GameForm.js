import React, { useState, useEffect } from 'react';
import DateTimePicker from 'react-datetime-picker';
import axios from 'axios';
import './forms.css';
import 'react-datetime-picker/dist/DateTimePicker.css'

const GameForm = ({ selectedScenario, refreshGames, closeForm  }) => {
    const [title, setTitle] = useState('');
    const [beginning_date, setBeginningDate] = useState('');
    const [end_date, setEndDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('scenario', selectedScenario.id);
        formData.append('beginning_date', beginning_date);
        formData.append('end_date', end_date);

        try {
            await axios.post('http://localhost:8000/api/games/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            refreshGames();
            closeForm();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form className="form-container2" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
            />
            <div className='razem'>
                <DateTimePicker label="Czas rozpoczęcia" onChange={(date) => setBeginningDate(date)} value={beginning_date} />
            </div>
            <div className='razem'>
                <DateTimePicker label="Czas zakończenia" onChange={(date) => setEndDate(date)} value={end_date} />
            </div>
            <button type="submit">Zaplanuj grę</button>
        </form>
    );
};

export default GameForm;
