import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';
import axios from 'axios';
import '../styles/forms.css';
import 'react-datetime-picker/dist/DateTimePicker.css'

const GameForm = ({ selectedScenario, refreshGames, closeForm  }) => {
    const [title, setTitle] = useState('');
    const [beginning_date, setBeginningDate] = useState('');
    const [end_date, setEndDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('scenario_id', selectedScenario.id);
        formData.append('beginning_date', beginning_date);
        formData.append('end_date', end_date);

        try {
            await axios.post('/api/games/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            refreshGames();
            closeForm();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
            />
            <div className='razem'>
                <div className='date'>
                    <label htmlFor="beginning-date">Czas rozpoczęcia</label>
                    <DateTimePicker id="beginning-date" onChange={(date) => setBeginningDate(date)} value={beginning_date} />
                </div>
                <div className='date'>
                    <label htmlFor="end-date">Czas zakończenia</label>
                    <DateTimePicker id="end-date" label="Czas zakończenia" onChange={(date) => setEndDate(date)} value={end_date} />
                </div>
            </div>
            <button type="submit">Zaplanuj grę</button>
        </form>
    );
};

export default GameForm;
