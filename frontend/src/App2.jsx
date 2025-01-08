import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import { AuthProvider } from './services/AuthProvider';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="admin">
                            <Route path="scenarios" />
                            <Route path="games" />
                        </Route>
                        <Route path="user">
                            <Route path="games" />
                            <Route path="my-games" />
                        </Route>
                        <Route path="*" element={<NoPage/>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}