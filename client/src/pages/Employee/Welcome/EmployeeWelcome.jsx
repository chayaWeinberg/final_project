import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/authStorage';
import './EmployeeWelcome.css';

function EmployeeWelcome() {
    const navigate = useNavigate();
    const user = getUser();
    const [phase, setPhase] = useState('enter'); // enter → show → exit

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('show'),  600);
        const t2 = setTimeout(() => setPhase('exit'), 3400);
        const t3 = setTimeout(() => navigate('/employee', { replace: true }), 4300);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [navigate]);

    return (
        <div className={`emp-welcome emp-welcome--${phase}`}>

            {/* Background grid */}
            <div className="emp-welcome__bg-grid" />

            {/* Glow blob */}
            <div className="emp-welcome__glow" />

            {/* Corner decorative rings */}
            <div className="emp-welcome__corner-ring emp-welcome__corner-ring--1" />
            <div className="emp-welcome__corner-ring emp-welcome__corner-ring--2" />
            <div className="emp-welcome__corner-ring emp-welcome__corner-ring--3" />
            <div className="emp-welcome__corner-ring emp-welcome__corner-ring--4" />

            {/* Floating sparkles */}
            <div className="emp-welcome__sparkles">
                {[...Array(12)].map((_, i) => (
                    <span key={i} className={`emp-sparkle emp-sparkle--${i + 1}`} />
                ))}
            </div>

            {/* Center card */}
            <div className="emp-welcome__card">

                {/* Avatar */}
                <div className="emp-welcome__avatar-wrap">
                    <div className="emp-welcome__ring emp-welcome__ring--1" />
                    <div className="emp-welcome__ring emp-welcome__ring--2" />
                    <div className="emp-welcome__ring emp-welcome__ring--3" />
                    <img
                        src="/image/employee.png"
                        alt="עובד"
                        className="emp-welcome__avatar"
                    />
                </div>

                {/* Text */}
                <div className="emp-welcome__text">
                    <p className="emp-welcome__greeting">ברוך הבא,</p>
                    <h1 className="emp-welcome__name">{user?.name || 'עובד'}</h1>
                    <p className="emp-welcome__role">עובד • מסעדת יאמי</p>
                </div>

                {/* Loader */}
                <div className="emp-welcome__loader">
                    <div className="emp-welcome__loader-bar">
                        <div className="emp-welcome__loader-fill" />
                    </div>
                    <span className="emp-welcome__loader-text">טוען את הפאנל שלך...</span>
                </div>

            </div>
        </div>
    );
}

export default EmployeeWelcome;
