import { useAuth } from '../services/AuthProvider';

const Home = () => {
    const { user } = useAuth();
    return (
        <div>
            <h1>Welcome {user?.username}</h1>
            <p>{user?.is_staff}</p>
            {user?.is_staff ? (
                <p>Jesteś adminem</p>
            ) : (
                <p>Jesteś graczem</p>
            )}
        </div>
    )
}

export default Home;