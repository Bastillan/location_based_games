import React, { useEffect, useState } from 'react';
import axios from 'axios';


const TaskList = ({ selectedScenario }) => {
    const tasks = selectedScenario.tasks || [];  // assuming tasks are part of the scenario

    return (
        <div>
            <h2>Tasks for Scenario: {selectedScenario.title}</h2>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <h3>{task.number}</h3>
                        <p>{task.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;


// const TaskList = () => {
//     const [tasks, setTasks] = useState([]);

//     const fetchTasks = async () => {
//         try {
//             const response = await axios.get('http://localhost:8000/api/tasks/');
//             setTasks(response.data);
//         } catch (error) {
//             console.error('Error fetching tasks:', error);
//         }
//     };

//     useEffect(() => {
//         fetchTasks();
//     }, []);

//     const deleteTask = (taskId) => {
//         axios.delete(`http://localhost:8000/api/tasks/${taskId}/`)
//             .then(() => {
//                 // Update the state by removing the deleted task
//                 setTasks(tasks.filter(task => task.id !== taskId));
//             })
//             .catch(error => console.error('Error deleting task:', error));
//     };

//     return (
//         <div>
//             <h1>Task List</h1>
//             <ul>
//                 {tasks.map((task) => (
//                     <div key={task.id}>
//                         <h3>Task {task.number}</h3>
//                         <p>{task.description}</p>
//                         {task.image && (
//                             <div>
//                                 <h4>Image:</h4>
//                                 <img src={task.image} alt="Task" style={{ width: '100px', height: '100px' }} />
//                             </div>
//                         )}
//                         {task.audio && (
//                             <div>
//                                 <h4>Audio:</h4>
//                                 <audio controls>
//                                     <source src={task.audio} type="audio/mpeg" />
//                                     Your browser does not support the audio element.
//                                 </audio>
//                             </div>
//                         )}
//                         <button onClick={() => deleteTask(task.id)}>Delete Task</button>
//                     </div>
//                 ))}
//             </ul>
//         </div>
//     );
// };
// export default TaskList;
