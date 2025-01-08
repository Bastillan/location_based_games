import { Outlet } from 'react-router-dom';

import { useAuth } from '../services/AuthProvider';
import { useState } from 'react';

import Login from '../modals/Login';
import Register from '../modals/Register';

import '../mainView.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const [isRegisterFormVisible, setIsRegisterFormVisible] = useState(false);
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);

    return (
        <div className="main">
            <nav className='logNav'>
                {user ? (
                    <button className='mainBut logout' onClick={logout}>Wyloguj się</button>
                ) : (
                    <>
                        <button className='mainBut register' onClick={() => setIsRegisterFormVisible(true)}>Zarejestruj się</button>
                        <button className='mainBut login' onClick={() => setIsLoginFormVisible(true)}>Zaloguj się</button>
                    </>
                )}
            </nav>
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