import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import api from './api'
import './TasksPlayList.css';


const TasksPlayList = ({ game, tasks, handleBackToGamesList }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [globalIndex, setGlobalIndex] = useState(0);
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [answer, setAnswer] = useState("");
    const [message, setMessage] = useState(null);
    const [AnswerImages, setAnswerImages] = useState([]);
    const [answer_correct, setAnswerCorrect] = useState([null, 0]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [userRegistered, setUserRegistered] = useState(false);
    const [members, setMembers] = useState(null);
    const [user, setUser] = useState(null);
    const [registerMessage, setRegisterMessage] = useState(null);

    const checkAnswer = async (TaskId, AnswerType, Answer) => {
        try {
            const response = await axios.get(`/api/tasks/check_answer/?answer_type=${AnswerType}&answer=${Answer}&task_id=${TaskId}`);
            setAnswerCorrect([response.data.is_correct, answer_correct[1]+1]);
        } catch (error) {
            console.error("Error checking answer: ", error)
        }
    };

    const handleRegisterToGame = async (e) => {
        e.preventDefault();
        setRegisterMessage(null);

        try {
            const payload = {
                game: game.id
            };

            await api.post('/api/teams/', payload);

            setRegisterMessage('Pomyślnie zarejestrowano do gry');
            setUserRegistered(true);
        } catch (error) {
            setRegisterMessage('Wystąpił błąd: ' + error.message);
        }
    };

    const fetchUserData = async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data);
            }, 2000);
        });
    };

    useEffect(() => {
        setUser
    }, [user])

    const handleNext = () => {
        if (currentIndex < tasks.length - 1) {
            setIsNextDisabled(currentIndex === globalIndex - 1);
            setIsSubmitDisabled(currentIndex !== globalIndex - 1);
            setCurrentIndex(currentIndex + 1);
            setAnswer("");
            setMessage(null);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsNextDisabled(false);
            setIsSubmitDisabled(true);
            setAnswer("");
            setMessage(null);
        }
    };

    const handleSubmit = () => {
        checkAnswer(tasks[currentIndex].id, tasks[currentIndex].answer_type, answer);
    }

    const handleChooseImage = (id) => {
        setSelectedImage(id);
        setAnswer(id);
    }

    const handleLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position.coords);
            setAnswer(position.coords.latitude + ", " + position.coords.longitude);
        })
    }

    const fetchImageAnswers = async (TaskId) => {
        try {
            const response = await axios.get(`/api/answerimages/?task_id=${TaskId}`);
            setAnswerImages(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        const currentTaskId = tasks[currentIndex]?.id;
        if (currentTaskId) {
            fetchImageAnswers(currentTaskId);
        }
    }, [currentIndex, tasks]);

    useEffect(() => {
        if (answer_correct[0] != null){
            if (answer_correct[0] === true) {
                setIsNextDisabled(currentIndex === tasks.length -1);
                setGlobalIndex(globalIndex + 1);
                setIsSubmitDisabled(true);
                setMessage(null);
            } else {
                const currentTaskId = tasks[currentIndex]?.id;
                setMessage("Niepoprawna odpowiedź");
                fetchImageAnswers(currentTaskId);
            }
        }
    }, [answer_correct])

    const completionPercentage = Math.round(((currentIndex) / tasks.length) * 100);

    return (
        userRegistered ? (
            <div className='task'>
                <button className='mainBut powrot' onClick={handleBackToGamesList}>Wróć do listy gier</button>
                <div className="circular-progress-container">
                    <svg className="circular-progress" viewBox="0 0 36 36">
                        <path
                            className="circle-bg"
                            d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="circle"
                            strokeDasharray={`${completionPercentage}, 100`}
                            d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">{completionPercentage}%</text>
                    </svg>
                </div>
                {tasks.length > 0 && tasks[currentIndex] && (
                    <div>
                        <h3>Zadanie {currentIndex + 1}</h3>
                        <p>Opis zadania: {tasks[currentIndex].description}</p>
                        {tasks[currentIndex].image && (
                            <img src={tasks[currentIndex].image} alt="obraz" />
                        )}
                        {tasks[currentIndex].audio && (
                            <audio controls>
                                <source src={tasks[currentIndex].audio} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        )}
                        {message && (
                            <p className='message'>{message}</p>
                        )}
                        {tasks[currentIndex].answer_type === "text" && (
                            <textarea placeholder='Wprowadź odpowiedź' value={answer} onChange={(e) => setAnswer(e.target.value)}></textarea>
                        )}
                        <div className='answer_images'>
                        {
                            tasks[currentIndex].answer_type === "image" && (
                                AnswerImages.map((answerImage) => (
                                <div
                                    key={answerImage.id}
                                    className={`image_container ${
                                        selectedImage === answerImage.id ? "highlighted" : ""
                                    }`}
                                    onClick={() => handleChooseImage(answerImage.id)}
                                >
                                    <img className="answer_image" src={answerImage.image} alt="obraz" />
                                </div>
                            ))
                        )}
                        {tasks[currentIndex].answer_type === "location" && (
                            <div className='location_container'>
                                <label>Szerokość geograficzna: {answer.split(',')[0]}</label><br></br>
                                <label>Długość geograficzna: {answer.split(',')[1]}</label>
                                <button className="check_location" onClick={() => handleLocation()} >Sprawdź lokalizacje</button>
                            </div>
                        )}
                        </div>
                    </div>
                )}
                <div className="buttons">
                    <button className="previous" onClick={() => handlePrevious()} disabled={currentIndex === 0}>Poprzednie</button>
                    <button className="submit" onClick={() => handleSubmit()} disabled={isSubmitDisabled}>Zatwierdź odpowiedź</button>
                    <button className="next" onClick={() => handleNext()} disabled={isNextDisabled}>Następne</button>
                </div>
            </div>
        ) : (
            <div>
                <button className='mainBut powrot' onClick={handleBackToGamesList}>Wróć do listy gier</button>
                <form className="form-container" onSubmit={handleRegisterToGame}>
                    <input
                    type="members"
                    placeholder={`Ilość członków zespołu`}
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    min="1"
                    max="20"
                    className="form-input"
                    />
                    <button type="submit">Dołącz do gry</button>
                </form>
                {registerMessage && (
                    <p className='message'>{registerMessage}</p>
                )}
            </div>
        )
    );
};

export default TasksPlayList;
