import { useState } from 'react';

// Used for sending emails to users
const ReportForm = ({ gameId, onGenerateReport, onClose, reportStatus }) => {
    const [options, setOptions] = useState({
        game_id: gameId,
        include_game_title: true,
        include_game_dates: true,
        include_scenario_title: true,
        include_number_of_tasks: true,
        include_number_of_teams: true,
        include_total_number_of_players: true,
        include_teams_details: true,
    });
    const status = useState(reportStatus);

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerateReport(options);
    };

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setOptions((prevOptions) => ({
            ...prevOptions,
            [name]: checked,
        }));
    };

    return (
        <div className="overlay">
            <div className="modal">
                <h3>Wygeneruj raport z gry</h3>
                <form className="form-container" onSubmit={handleSubmit}>
                    <div>
                        <label className='form-label'>
                        <input
                            type="checkbox"
                            name="include_game_title"
                            checked={options.include_game_title}
                            onChange={handleChange}
                        />
                        Tytuł gry
                        </label>
                    </div>
                    <div>
                        <label className='form-label'>
                        <input
                            type="checkbox"
                            name="include_game_dates"
                            checked={options.include_game_dates}
                            onChange={handleChange}
                        />
                        Okres aktywności
                        </label>
                    </div>
                    <div>
                        <label className='form-label'>
                        <input
                            type="checkbox"
                            name="include_scenario_title"
                            checked={options.include_scenario_title}
                            onChange={handleChange}
                        />
                        Tytuł scenariusza
                        </label>
                    </div>
                    <div>
                        <label className='form-label'>
                        <input
                            type="checkbox"
                            name="include_number_of_tasks"
                            checked={options.include_number_of_tasks}
                            onChange={handleChange}
                        />
                        Liczba zadań
                        </label>
                    </div>
                    <div>
                        <label className='form-label'>
                        <input
                            type="checkbox"
                            name="include_number_of_teams"
                            checked={options.include_number_of_teams}
                            onChange={handleChange}
                        />
                        Liczba zespołów
                        </label>
                    </div>
                    <div>
                        <label className='form-label'>
                        <input
                            type="checkbox"
                            name="include_total_number_of_players"
                            checked={options.include_total_number_of_players}
                            onChange={handleChange}
                        />
                        Sumaryczna liczba graczy
                        </label>
                    </div>
                    <div>
                        <label className='form-label'>
                        <input
                            type="checkbox"
                            name="include_teams_details"
                            checked={options.include_teams_details}
                            onChange={handleChange}
                        />
                        Statystyki zespołów
                        </label>
                    </div>
                    <button className="mainBut" type="submit">Wygeneruj</button>
                    
                    {status && <div className="reportStatus">{reportStatus}</div>}
                    <button
                        className="mainBut"
                        type="button"
                        onClick={onClose}
                    >
                        Zamknij
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportForm;
