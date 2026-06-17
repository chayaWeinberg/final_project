import { useNavigate } from 'react-router-dom';
import { logout } from '../api/authApi';

function useLogout(setUser) {
    const navigate = useNavigate();

    return async () => {
        try {
            await logout(); // This will clear cookies on server
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
            // Even if server call fails, clear client state
            setUser(null);
            navigate('/login');
        }
    };
}

export default useLogout;
