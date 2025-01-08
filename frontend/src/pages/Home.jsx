import { useAuth } from '../services/AuthProvider';

const Home = () => {
    const { user } = useAuth();
    return (
        <div>
            <h1>Welcome {user?.username}</h1>
        </div>
    )
}

export default Home;