import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './forms.css';

const ScenarioForm = ({ refreshScenarios, closeForm, scenarioToEdit  }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (scenarioToEdit) {
            setTitle(scenarioToEdit.title);
            setDescription(scenarioToEdit.description);
            setImage(null);
        }
    }, [scenarioToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Tworzymy obiekt FormData do przesłania formularza
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (image) formData.append('image', image);

        try {
            if (scenarioToEdit) {
                // Edytujemy istniejący scenariusz
                await axios.put(`http://localhost:8000/api/scenarios/${scenarioToEdit.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                // Tworzymy nowy scenariusz
                await axios.post('http://localhost:8000/api/scenarios/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            refreshScenarios();
            closeForm();
        } catch (error) {
            console.error('Error handling form submission:', error);
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
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
            ></textarea>
            <label className="form-label">
                Obrazek:
                <input className="form-input" type="file" onChange={(e) => setImage(e.target.files[0])} />
            </label>
            <button type="submit">{scenarioToEdit ? 'Edytuj Scenariusz' : 'Dodaj Scenariusz'}</button>
        </form>
    );
};

export default ScenarioForm;
