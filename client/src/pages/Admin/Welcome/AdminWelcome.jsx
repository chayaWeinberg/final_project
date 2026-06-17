import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/authStorage';
import './AdminWelcome.css';

function AdminWelcome() {
    const navigate = useNavigate();
    const user = getUser();
    const [phase, setPhase] = useState('enter'); // enter → show → exit

    useEffect(() => {
        // After 600ms start showing content
        const t1 = setTimeout(() => setPhase('show'), 600);
        // After 3.2s start exit animation
        const t2 = setTimeout(() => setPhase('exit'), 3200);
        // After exit animation completes navigate
        const t3 = setTimeout(() => navigate('/admin', { replace: true }), 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [navigate]);

    return (
        <div className={`welcome-screen welcome-screen--${phase}`}>
            {/* Floating particles */}
            <div className="welcome-particles">
                {[...Array(12)].map((_, i) => (
                    <span key={i} className={`particle particle--${i + 1}`} />
                ))}
            </div>

            {/* Center card */}
            <div className="welcome-card">
                <div className="welcome-avatar-wrap">
                    <div className="welcome-avatar-ring" />
                    <img
                        src="/image/admin-avatar.png"
                        alt="מנהל"
                        className="welcome-avatar"
                    />
                </div>

                <div className="welcome-text">
                    <p className="welcome-sub">ברוך הבא,</p>
                    <h1 className="welcome-name">{user?.name || 'מנהל'}</h1>
                    <p className="welcome-tagline">מוכן לנהל את יאמי?</p>
                </div>

                <div className="welcome-loader">
                    <div className="welcome-loader__bar" />
                </div>
            </div>
        </div>
    );
}

export default AdminWelcome;
