import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TasksPlayList.css';


const TasksPlayList = ({ tasks, handleBackToGamesList }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [globalIndex, setGlobalIndex] = useState(0);
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [answer, setAnswer] = useState("");

    const handleNext = () => {
        if (currentIndex < tasks.length - 1) {
            setIsNextDisabled(currentIndex == globalIndex - 1);
            setIsSubmitDisabled(currentIndex != globalIndex - 1);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsNextDisabled(false);
            setIsSubmitDisabled(true);
        }
    };

    const handleSubmit = () => {
        if (tasks[currentIndex].correct_answer === answer) {
            setIsNextDisabled(currentIndex === tasks.length -1);
            setGlobalIndex(globalIndex + 1);
            setIsSubmitDisabled(true);
        }
    }

    return (
        <div>
            <button className='mainBut powrot' onClick={handleBackToGamesList}>Wróć do listy gier</button>
            {tasks.length > 0 && tasks[currentIndex] && (
                <div>
                    <h3>Zadanie {currentIndex + 1} current_index/global_index: {currentIndex}/{globalIndex}</h3>
                    <p>Opis zadania: {tasks[currentIndex].description}</p>
                    {tasks[currentIndex].image && (
                        <img src={tasks[currentIndex].image} alt="obraz" />
                    )}
                    {tasks[currentIndex].audio && (
                        <img src={tasks[currentIndex].audio} alt="audio" />
                    )}
                    <p>{tasks[currentIndex].correct_answer}</p>
                </div>
            )}

            <div>
            <textarea placeholder='Wprowadź odpowiedź' value={answer} onChange={(e) => setAnswer(e.target.value)}></textarea>
            </div>
            <div className="butons">
                <button className="previous" onClick={() => handlePrevious()} disabled={currentIndex === 0}>Poprzednie</button>
                <button className="submit" onClick={() => handleSubmit()} disabled={isSubmitDisabled}>Zatwierdź odpowiedź</button>
                <button className="next" onClick={() => handleNext()} disabled={isNextDisabled}>Następne</button>
            </div>
        </div>
    );
};

export default TasksPlayList;
