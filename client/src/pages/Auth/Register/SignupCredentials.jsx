import React from "react";
import { useState } from "react";

function  SignupCredentials({ onSubmit })  {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordVerification, setPasswordVerification] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)


    const validatePassword = (password) => {
        if (password.length < 8) {
            return "הסיסמה חייבת להכיל לפחות 8 תווים"
        }
        if (!/[a-zA-Z]/.test(password)) {
            return "הסיסמה חייבת להכיל לפחות אות אחת"
        }
        if (!/[0-9]/.test(password)) {
            return "הסיסמה חייבת להכיל לפחות מספר אחד"
        }
        return null
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError("")

        if (!email || !password || !passwordVerification) {
            setError("אנא מלא את כל השדות")
            return
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            setError(passwordError)
            return
        }

        if (password !== passwordVerification) {
            setError("אימות סיסמה שגוי")
            return
        }

        onSubmit({ email: email.trim().toLowerCase(), password })
    }


    return (
        <>
            <h1>register</h1>
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <label className="auth-label">שם משתמש</label>
                <input
                    type="email"
                    placeholder="הכנס מייל ..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    disabled={loading}
                />
                <label className="auth-label">סיסמה</label>
                <input
                    type="password"
                    placeholder="הכנס סיסמה..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    disabled={loading}
                />
                <label className="auth-label">אימות סיסמה</label>
                <input
                    type="password"
                    placeholder="הכנס את הסיסמה שוב ..."
                    value={passwordVerification}
                    onChange={(e) => setPasswordVerification(e.target.value)}
                    className="auth-input"
                    disabled={loading}
                />
                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? (
                        <>
                            מתחבר...
                        </>
                    ) : (
                        "להרשמה"
                    )}
                </button>
            </form>

        </>
    )
}
export default SignupCredentials