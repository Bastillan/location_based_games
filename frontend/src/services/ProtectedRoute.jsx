import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children, is_staff }) => {
    const { user } = useAuth();

    if (!user || user.is_staff !== is_staff) {
        return <Navigate to='/' />;
    }
    
    return children;
}

export default ProtectedRoute;