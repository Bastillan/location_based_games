import React, { useState } from 'react';
import axios from 'axios';
import './forms.css';

const ScenarioForm = ({ refreshScenarios, closeForm }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (image) formData.append('image', image);

        try {
            await axios.post('http://localhost:8000/api/scenarios/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            refreshScenarios();
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
            <button type="submit">Dodaj Scenariusz</button>
        </form>
    );
};

export default ScenarioForm;
