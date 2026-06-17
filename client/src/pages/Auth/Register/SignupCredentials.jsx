import React from "react";
import { useState } from "react";
import './SignupCredentials.css';

function SignupCredentials({ onSubmit }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordVerification, setPasswordVerification] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordVerification, setShowPasswordVerification] = useState(false)
    const [validations, setValidations] = useState({
        email: false,
        password: false,
        match: false
    })

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const validatePassword = (password) => {
        return password.length >= 8;
    }

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setValidations(prev => ({
            ...prev,
            email: validateEmail(newEmail)
        }));
    }

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setValidations(prev => ({
            ...prev,
            password: validatePassword(newPassword),
            match: newPassword === passwordVerification
        }));
    }

    const handlePasswordVerificationChange = (e) => {
        const newPasswordVerification = e.target.value;
        setPasswordVerification(newPasswordVerification);
        setValidations(prev => ({
            ...prev,
            match: password === newPasswordVerification
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError("")

        if (!email || !password || !passwordVerification) {
            setError("אנא מלא את כל השדות")
            return
        }

        if (!validations.email) {
            setError("פורמט האימייל לא תקין")
            return
        }

        if (!validations.password) {
            setError("הסיסמה חייבת להכיל לפחות 8 תווים")
            return
        }

        if (!validations.match) {
            setError("אימות סיסמה שגוי")
            return
        }

        onSubmit({ email: email.trim().toLowerCase(), password })
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card__brand">
                    <img src="/image/logo.png" alt="יאמי" className="auth-card__logo" />
                    <div className="auth-card__brand-text">
                        <span>הרשמה ליאמי</span>
                        <p>שלב ראשון: הזן את פרטי ההתחברות שלך.</p>
                    </div>
                </div>
                <p className="signup-subtitle">שלב ראשון: פרטי התחברות</p>
                
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
                            onChange={handleEmailChange}
                            className={`auth-input ${email ? (validations.email ? 'valid' : 'invalid') : ''}`}
                            disabled={loading}
                            dir="ltr"
                        />
                        {email && (
                            <small className={`validation-hint ${validations.email ? 'valid' : 'invalid'}`}>
                                {validations.email ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                        </svg>
                                        פורמט תקין
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                        </svg>
                                        פורמט לא תקין
                                    </>
                                )}
                            </small>
                        )}
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
                                onChange={handlePasswordChange}
                                className={`auth-input ${password ? (validations.password ? 'valid' : 'invalid') : ''}`}
                                disabled={loading}
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
                        {password && (
                            <small className={`validation-hint ${validations.password ? 'valid' : 'invalid'}`}>
                                {validations.password ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                        </svg>
                                        לפחות 8 תווים
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                        </svg>
                                        לפחות 8 תווים נדרשים
                                    </>
                                )}
                            </small>
                        )}
                    </div>
                    
                    <div className="auth-field">
                        <label className="auth-label">
                            <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            אימות סיסמה
                        </label>
                        <div className="auth-field__input-wrap">
                            <input
                                type={showPasswordVerification ? 'text' : 'password'}
                                placeholder="הכנס את הסיסמה שוב..."
                                value={passwordVerification}
                                onChange={handlePasswordVerificationChange}
                                className={`auth-input ${passwordVerification ? (validations.match ? 'valid' : 'invalid') : ''}`}
                                disabled={loading}
                                dir="ltr"
                            />
                            <button
                                type="button"
                                className="show-pass-btn"
                                onClick={() => setShowPasswordVerification(!showPasswordVerification)}
                                disabled={loading}
                            >
                                {showPasswordVerification ? (
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
                        {passwordVerification && (
                            <small className={`validation-hint ${validations.match ? 'valid' : 'invalid'}`}>
                                {validations.match ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                        </svg>
                                        סיסמאות זהות
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                        </svg>
                                        סיסמאות לא זהות
                                    </>
                                )}
                            </small>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-submit" 
                        disabled={loading || !validations.email || !validations.password || !validations.match}
                    >
                        {loading ? 'מעבד...' : 'המשך לשלב 2'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SignupCredentials