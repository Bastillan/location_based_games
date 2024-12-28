import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './forms.css';

const TaskForm = ({ selectedScenario, refreshScenarios, closeForm, taskToEdit }) => {
    const [description, setDescription] = useState(taskToEdit ? taskToEdit.description : '');
    const [answer_type, setAnswerType] = useState(taskToEdit ? taskToEdit.answer_type : '');
    const [correct_text_answer, setCorrectAnswer] = useState(taskToEdit ? taskToEdit.correct_text_answer : "")
    const [number, setNumber] = useState(taskToEdit ? taskToEdit.number : '');
    const [correctImages, setCorrectImages] = useState(null);
    const [incorrectImages, setInorrectImages] = useState(null);
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const [error, setError] = useState('');
    const [tasksCount, setTasksCount] = useState(0);

    useEffect(() => {
        const fetchTasksCount = async () => {
            if (selectedScenario) {
                try {
                    const response = await axios.get(
                        `/api/tasks/?scenario=${selectedScenario.id}`
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
            setError(`Numer zadania musi być między 1 a ${ taskToEdit ? tasksCount : tasksCount + 1 }`);
            return;
        }

        const formData = new FormData();
        formData.append('number', taskNumber);
        formData.append('description', description);
        formData.append('scenario', selectedScenario.id);
        formData.append('answer_type', answer_type);
        formData.append('correct_text_answer', correct_text_answer);
        if (correct_text_answer && answer_type === 'text') formData.append('answer_type', answer_type);
        if (correctImages && answer_type === 'image'){
            for (let i = 0 ; i < correctImages.length ; i++) {
                formData.append("correctImages", correctImages[i]);
            }
        };
        if (incorrectImages && answer_type === 'image') {
            for (let i = 0 ; i < incorrectImages.length ; i++) {
                formData.append("incorrectImages", incorrectImages[i]);
            }
        };
        if (image) formData.append('image', image);
        if (audio) formData.append('audio', audio);

        try {
            if (taskToEdit) {
                // Edit task API call
                await axios.put(`/api/tasks/${taskToEdit.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                // Add new task API call
                await axios.post('/api/tasks/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            refreshScenarios();
            setDescription('');
            setAnswerType(null);
            setCorrectAnswer('');
            setNumber('');
            setImage(null);
            setAudio(null);
            setError('');
            closeForm();
        } catch (error) {
            console.error('Error adding/updating task:', error);
            setError('Nie udało się dodać/edytować zadania. Spróbuj ponownie.');
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
                type="number"
                placeholder={`Numer zadania (od 1 do ${taskToEdit ? tasksCount : tasksCount + 1})`}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                min="1"
                max={taskToEdit ? tasksCount : tasksCount + 1}
                className="form-input"
            />
            <textarea
                placeholder="Opis zadania"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="form-input"
            ></textarea>
            <select
                id="answer_type"
                value={answer_type}
                onChange={(e) => setAnswerType(e.target.value)}
                required
                className="form-input"
            >
                <option value="">Wybierz typ odpowiedzi</option>
                <option value="text">Tekst</option>
                <option value="image">Obraz</option>
                <option value="location">Lokalizacja</option>
            </select>
            {answer_type === "text" &&
            <textarea
                placeholder="Poprawna odpowiedź"
                value={correct_text_answer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                required
                className="form-input"
            ></textarea>
            }
            {answer_type === "image" &&
                <label className="form-label">
                Poprawne obrazy:
                <input className="form-input" multiple type="file" onChange={(e) => setCorrectImages(e.target.files)} />
                Niepoprawne obrazy:
                <input className="form-input" multiple type="file" onChange={(e) => setInorrectImages(e.target.files)} />
            </label>
            }
            {answer_type === "location" &&
                <label className="form-label">
                <textarea
                    placeholder="Szerokość i wysokość geograficzna"
                    value={correct_text_answer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    required
                    className="form-input"
                ></textarea>
            </label>
            }
            <label className="form-label">
                Obrazek:
                <input className="form-input" type="file" onChange={(e) => setImage(e.target.files[0])} />
            </label>

            <label className="form-label">
                Dźwięk:
                <input className="form-input" type="file" onChange={(e) => setAudio(e.target.files[0])} />
            </label>

            <button type="submit">{taskToEdit ? 'Edytuj zadanie' : 'Dodaj zadanie'}</button>
        </form>
    );
};

export default TaskForm;
