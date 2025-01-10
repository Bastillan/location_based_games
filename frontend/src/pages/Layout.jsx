import { useNavigate, Outlet } from 'react-router-dom';

import { useAuth } from '../services/AuthProvider';
import { useState } from 'react';

import Login from '../modals/Login';
import Register from '../modals/Register';

import '../mainView.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isRegisterFormVisible, setIsRegisterFormVisible] = useState(false);
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <div className="main">
            <header>
                <nav className='logNav'>
                    {user ? (
                        <button className='mainBut logout' onClick={handleLogout}>Wyloguj się</button>
                    ) : (
                        <>
                            <button className='mainBut register' onClick={() => setIsRegisterFormVisible(true)}>Zarejestruj się</button>
                            <button className='mainBut login' onClick={() => setIsLoginFormVisible(true)}>Zaloguj się</button>
                        </>
                    )}
                </nav>
            </header>
            <main>
                <Outlet />
                {isRegisterFormVisible && (
                    <>
                        <div className='overlay'></div>
                        <div className='modal'>
                            <Register />
                            <button className='mainBut' onClick={() => setIsRegisterFormVisible(false)}>Zamknij</button>
                        </div>
                    </>
                )}
                {isLoginFormVisible && (
                    <>
                        <div className='overlay'></div>
                        <div className='modal'>
                            <Login />
                            <button className='mainBut' onClick={() => setIsLoginFormVisible(false)}>Zamknij</button>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

export default Layout;