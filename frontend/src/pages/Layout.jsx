import { useNavigate, Outlet } from 'react-router-dom';

import { useAuth } from '../services/AuthProvider';
import { useState } from 'react';

import LoginForm from '../modals/LoginForm';
import RegisterForm from '../modals/RegisterForm';

import '../styles/Layout.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isRegisterFormVisible, setIsRegisterFormVisible] = useState(false);
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    const handleAccountManagement = () => {
        navigate('/account');
    };

    return (
        <div>
            <header>
                    <nav className='logNav'>
                        {user ? (
                            <>
                                <button className='mainBut logout' onClick={handleLogout}>Wyloguj się</button>
                                <button className='mainBut account' onClick={handleAccountManagement}>Zarządzaj kontem</button>
                            </>

                        ) : (
                            <>
                                <button className='mainBut register' onClick={() => setIsRegisterFormVisible(true)}>Zarejestruj się</button>
                                <button className='mainBut login' onClick={() => setIsLoginFormVisible(true)}>Zaloguj się</button>
                            </>
                        )}
                    </nav>
                </header>
            <div className="main">
                <main>
                    <Outlet />
                    {isRegisterFormVisible && (
                        <RegisterForm closeForm={() => setIsRegisterFormVisible(false)} />
                    )}
                    {isLoginFormVisible && (
                        <LoginForm closeForm={() => setIsLoginFormVisible(false)}/>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Layout;