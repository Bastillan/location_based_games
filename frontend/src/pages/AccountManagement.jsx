import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/AuthProvider';

const AccountManagementPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [error, setError] = useState('');

    const handleDeleteAccount = async () => {
        if (!currentPassword) {
            setError('Wprowadź hasło do konta');
            return;
        }

        if (window.confirm('Czy na pewno chcesz usunąć konto?')) {
            try {
                await api.delete('/auth/users/me/', {
                    data: { current_password: currentPassword },
                });

                logout();
                navigate('/');
            } catch (error) {
                if (error.response?.status === 400) {
                    setError('Nieprawidłowe hasło, spróbuj ponownie');
                } else {
                    setError('Wystąpił błąd');
                }
            }
        }
    };

    return (
        <div className="account-management">
            <h1>Zarządzanie kontem</h1>
            <div>
                <label htmlFor="currentPassword">Hasło:</label>
                <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Wprowadź hasło"
                />
            </div>
            {error && <p className="error">{error}</p>}
            <button className={"mainBut deleteBut"} onClick={handleDeleteAccount}>
                Usuń konto
            </button>
        </div>
    );
};

export default AccountManagementPage;
