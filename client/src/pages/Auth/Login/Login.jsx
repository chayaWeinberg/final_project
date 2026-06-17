import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../../api/authApi';
import { saveUser } from '../../../utils/authStorage';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('אנא מלא את כל השדות');
            return;
        }
        if (!validateEmail(email)) {
            setError('פורמט האימייל לא תקין');
            return;
        }

        setLoading(true);
        try {
            const data = await login(email.trim().toLowerCase(), password);
            saveUser(data.user);
            if (data.user.role === 'admin')         navigate('/admin-welcome');
            else if (data.user.role === 'employee') navigate('/employee-welcome');
            else navigate('/home');
        } catch (err) {
            setError(err.message || 'שגיאה בהתחברות');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card__brand">
                    <img src="/image/logo.png" alt="יאמי" className="auth-card__logo" />
                    <div className="auth-card__brand-text">
                        <span>ברוכים הבאים ליאמי</span>
                        <p>התחברו כדי להזמין אוכל טרי, טעים ומהיר.</p>
                    </div>
                </div>

                <h1>התחברות</h1>

                {error && (
                    <div className="auth-error">
                        <svg className="auth-error__icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">
                            <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                            אימייל
                        </label>
                        <input
                            type="email"
                            placeholder="הכנס אימייל..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`auth-input ${email ? (validateEmail(email) ? 'valid' : 'invalid') : ''}`}
                            disabled={loading}
                            required
                            dir="ltr"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">
                            <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            סיסמה
                        </label>
                        <div className="auth-field__input-wrap">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="הכנס סיסמה..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input"
                                disabled={loading}
                                required
                                dir="ltr"
                            />
                            <button
                                type="button"
                                className="show-pass-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'מתחבר...' : 'התחבר'}
                    </button>
                </form>

                <p className="auth-footer">
                    אין לך חשבון עדיין? <Link to="/register" className="auth-link--primary">הירשם כאן</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
