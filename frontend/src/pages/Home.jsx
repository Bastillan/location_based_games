import { useAuth } from '../services/AuthProvider';
import { Navigate } from 'react-router-dom';

const Home = () => {
    const { user } = useAuth();
    return (
        <div>
            {!user ? (
                <div>
                    <h1>Platforma do Gier Miejskich</h1>
                    <p>Witamy na naszej platformie. Zaloguj się lub zarejestruj, aby rozpocząć grę!</p>
                </div>
            ) : (
                <h1>Witaj {user.username}</h1>
            )}
            {user && user.is_staff && (
                <Navigate to="/admin" />
            )}
            {user && !user.is_staff && (
                <Navigate to="/user" />
            )}
        </div>
    )
}

export default Home;