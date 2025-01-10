import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import { AuthProvider } from './services/AuthProvider';

import './styles/App.css';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="admin" element={<AdminPage />} />
                        <Route path="user" element={<UserPage />} />
                        <Route path="*" element={<NoPage/>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};


export default App;