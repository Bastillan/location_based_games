import React, { use, useEffect, useState } from 'react';
import api from '../services/api'
import '../styles/TasksPlayList.css';
import userIcon from '../assets/user-icon.svg';

// Used for displaying list of tasks in game
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
    const [registerMessage, setRegisterMessage] = useState(null);
    const [completionCounts, setCompletionCounts] = useState({});
    const [teamId, setTeamId] = useState(null);
    const [taskData, setTaskData] = useState(null);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [isGameEnded, setIsGameEnded] = useState(false);

    // Request to API to check answer is correct
    const checkAnswer = async (TaskId, AnswerType, Answer) => {
        try {
            const response = await api.get(`/api/tasks/check-answer/?answer_type=${AnswerType}&answer=${Answer}&task_id=${TaskId}`);
            setAnswerCorrect([response.data.is_correct, answer_correct[1]+1]);
        } catch (error) {
            console.error("Error checking answer: ", error);
        }
    };

    const getCurrentTask = async (teamId) => {
        try {
            const response = await api.get(`/api/task-completion/current-task/?team=${teamId}&scenario=${game.scenario.id}`);
            setTaskData(response.data.current_task);
            setCompletionPercentage(Math.round(response.data.percentage * 100));
            setIsGameEnded(response.data.ended);
        } catch (error) {
            console.error("Error getting task data: ", error)
        }
    };

    // Request to API to register to game
    const handleRegisterToGame = async (e) => {
        e.preventDefault();
        setRegisterMessage(null);
        try {
            const payload = {
                game: game.id
            };
            const response = await api.post('/api/teams/', payload);
            setTeamId(response.data.id);
            setRegisterMessage('Pomyślnie zarejestrowano do gry');
            setUserRegistered(true);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setRegisterMessage('Użytkownik już dołączył do tej gry.');
                setTeamId(error.response.data.team.id);
                setUserRegistered(true);
            } else if (error.response && error.response.status === 500) {
                setRegisterMessage('Żeby dołączyć do gry trzeba się zalogować.');
            }else {
                setRegisterMessage('Wystąpił błąd: ' + error.message);
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < tasks.length) {
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
            setAnswer(position.coords.latitude + ", " + position.coords.longitude);
        })
    }

    // Request to API to download all images for task
    const fetchImageAnswers = async (TaskId) => {
        try {
            const response = await api.get(`/api/answerimages/?task_id=${TaskId}`);
            setAnswerImages(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchCompletionCount = async (taskId) => {
        try {
            const response = await api.get(`/api/task-completion/?task=${taskId}`);
            const data = response.data;
            setCompletionCounts((prev) => ({
                ...prev,
                [taskId]: data.length,
            }));
        } catch (error) {
            console.error("Error fetching completion count: ", error);
        }
    };

    const createTaskCompletion = async (taskId) => {
        try {
            const payload = {task: taskId, team: teamId};
            await api.post('/api/task-completion/', payload);
            fetchCompletionCount(taskId);
        } catch (error) {
            console.error("Error creating task completion: ", error);
        }
    };

    const handleEnterGame = async (error) => {
        setTeamId(error.response.data.team.id);
        const newTeamId = error.response.data.team.id;
        setUserRegistered(true);
        await getCurrentTask(newTeamId);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payload = {
                    game: game.id
                };
                const response = await api.post('/api/teams/', payload);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    await handleEnterGame(error);
                } else if (error.response && error.response.status === 500) {
                    setRegisterMessage('Żeby dołączyć do gry trzeba się zalogować.');
                }else {
                    setRegisterMessage('Wystąpił błąd: ' + error.message);
                }
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const currentTaskId = tasks[currentIndex]?.id;
        if (currentTaskId) {
            fetchImageAnswers(currentTaskId);
            fetchCompletionCount(currentTaskId);
        }
    }, [currentIndex, tasks]);

    useEffect(() => {
        if (answer_correct[0] != null){
            if (answer_correct[0] === true) {
                setIsNextDisabled(currentIndex >= tasks.length);
                setGlobalIndex(globalIndex + 1);
                setIsSubmitDisabled(true);
                createTaskCompletion(tasks[currentIndex].id);
                setMessage('');
            } else {
                const currentTaskId = tasks[currentIndex]?.id;
                setMessage("Niepoprawna odpowiedź");
                fetchImageAnswers(currentTaskId);
            }
        }
    }, [answer_correct])


    return (
        // Checking user registered to game
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
                {isGameEnded ? (
                    <div className="congratulations">
                        <h2>Gratulacje!</h2>
                        <p>Udało Ci się przejść całą grę. Świetna robota!</p>
                    </div>
                ) : (
                // displaying tasks
                <div>
                {tasks.length > 0 && tasks[currentIndex] && (
                    <div>
                        <h3>Zadanie {currentIndex + 1}</h3>
                        <div className="teamsNum">
                        {completionCounts[tasks[currentIndex]?.id] || 0}
                        <img
                            src={userIcon}
                            alt="Ikona ludzika"
                            style={{ width: '30px', height: '30px', marginLeft: '2px', marginBottom: "-5px"}}
                        />
                        </div>
                        <p style={{marginTop: "3px"}}>Opis zadania: {tasks[currentIndex].description}</p>
                        {tasks[currentIndex].image && (
                            <img src={taskData.image} className="task_image" alt="obraz" />
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
                        <div>
                        {/* Checking type of answer */}
                        {tasks[currentIndex].answer_type === "text" && (
                            <textarea placeholder='Wprowadź odpowiedź' value={answer} onChange={(e) => setAnswer(e.target.value)}></textarea>
                        )}
                        </div>
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
                        <div>
                        {tasks[currentIndex].answer_type === "location" && (
                            <div className='location_container'>
                                <label>Szerokość geograficzna: {answer.split(',')[0]}</label><br></br>
                                <label>Długość geograficzna: {answer.split(',')[1]}</label>
                                <button className="check_location" onClick={() => handleLocation()} >Sprawdź lokalizacje</button>
                            </div>
                        )}
                        </div>
                        </div>
                    </div>
                )}
                </div>)}
                <div className="buttons">
                    <button className="previous" onClick={() => handlePrevious()} disabled={currentIndex === 0}>Poprzednie</button>
                    {(currentIndex < tasks.length) && (
                        <>
                            <button className="submit" onClick={() => handleSubmit()} disabled={isSubmitDisabled}>Zatwierdź odpowiedź</button>
                            <button className="next" onClick={() => handleNext()} disabled={isNextDisabled}>Następne</button>
                        </>
                    )}
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
