import { useNavigate } from 'react-router-dom';

function useLogout(setUser) {
    const navigate = useNavigate();

    return () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };
}

export default useLogout;
