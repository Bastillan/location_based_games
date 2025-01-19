import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import AccountManagement from './pages/AccountManagement';
import { AuthProvider } from './services/AuthProvider';
import ProtectedRoute from './services/ProtectedRoute';

import './styles/App.css';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import ActivateAccount from "./pages/ActivateAccount";

// Generates main application view
const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="admin" element={<ProtectedRoute is_staff={true}><AdminPage /></ProtectedRoute>} />
                        <Route path="user" element={<ProtectedRoute is_staff={false}><UserPage /></ProtectedRoute>} />
                        <Route path="account" element={<ProtectedRoute is_staff={false}><AccountManagement /> </ProtectedRoute>} />
                        <Route path="*" element={<NoPage/>} />
                        <Route path="/account" element={<AccountManagement />} />
                        <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
                        <Route path="/activate" element={<ActivateAccount/>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};


export default App;