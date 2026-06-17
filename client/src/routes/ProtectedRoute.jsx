import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUser } from '../utils/authStorage';

function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Date.now() / 1000;
    } catch {
        return true;
    }
}

// Where each role should land by default
const ROLE_HOME = {
    admin:    '/admin-welcome',
    employee: '/employee-welcome',
    customer: '/home',
};

function ProtectedRoute({ children, requiredRole }) {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        const user = getUser();
        if (!user) return <Navigate to="/login" replace />;

        if (user.role !== requiredRole) {
            // Redirect to the correct home for this user's role instead of login
            const fallback = ROLE_HOME[user.role] || '/login';
            return <Navigate to={fallback} replace />;
        }
    }

    return children ?? <Outlet />;
}

export default ProtectedRoute;
