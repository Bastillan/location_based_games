import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './forms.css';

const TaskForm = ({ selectedScenario, refreshScenarios, closeForm  }) => {
    const [description, setDescription] = useState('');
    const [number, setNumber] = useState('');
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const [error, setError] = useState('');
    const [tasksCount, setTasksCount] = useState(0);

    useEffect(() => {
        const fetchTasksCount = async () => {
            if (selectedScenario) {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/tasks/?scenario=${selectedScenario.id}`
                    );
                    setTasksCount(response.data.length);
                } catch (error) {
                    console.error('Error fetching task count:', error);
                    setError('Nie udało się pobrać liczby zadań.');
                }
            }
        };

        fetchTasksCount();
    }, [selectedScenario]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedScenario) {
            setError('Scenariusz nie jest wybrany.');
            return;
        }

        const taskNumber = number ? parseInt(number) : tasksCount + 1;

        if (taskNumber < 1 || taskNumber > tasksCount + 1) {
            setError(`Numer zadania musi być między 1 a ${tasksCount + 1}`);
            return;
        }

        const formData = new FormData();
        formData.append('number', taskNumber);
        formData.append('description', description);
        formData.append('scenario', selectedScenario.id);
        if (image) formData.append('image', image);
        if (audio) formData.append('audio', audio);

        try {
            await axios.post('http://localhost:8000/api/tasks/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            refreshScenarios();
            setDescription('');
            setNumber('');
            setImage(null);
            setAudio(null);
            setError('');
            closeForm();
        } catch (error) {
            console.error('Error adding task:', error);
            setError('Nie udało się dodać zadania. Spróbuj ponownie.');
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
                type="number"
                placeholder={`Numer zadania (od 1 do ${tasksCount + 1})`}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                min="1"
                max={tasksCount + 1}
                className="form-input"
            />
            <textarea
                placeholder="Opis zadania"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="form-input"
            ></textarea>

            <label className="form-label">
                Obrazek:
                <input className="form-input" type="file" onChange={(e) => setImage(e.target.files[0])} />
            </label>

            <label className="form-label">
                Dźwięk:
                <input className="form-input" type="file" onChange={(e) => setAudio(e.target.files[0])} />
            </label>

            <button type="submit">Dodaj zadanie</button>
        </form>
    );
};

export default TaskForm;
