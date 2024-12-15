import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TasksPlayList.css';


const TasksPlayList = ({ tasks, handleBackToGamesList }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < tasks.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div>
            <button className="mainBut powrot" onClick={handleBackToGamesList}> Wróć do listy gier</button>
            <div>
                <h3>Zadanie {currentIndex + 1}</h3>
                <p>Liczba zadań: {tasks.length}; index zadania: {currentIndex}</p>
            </div>

            <div className="butons">
                <button className="previous" onClick={() => handlePrevious()} disabled={currentIndex === 0}>Poprzednie</button>
                <button className="next" onClick={() => handleNext()} disabled={currentIndex === tasks.length - 1}>Następne</button>
            </div>
        </div>
    );
};

export default TasksPlayList;
