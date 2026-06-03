
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../../api/authApi'
import { Link } from "react-router-dom";
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')


    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("אנא מלא את כל השדות")
            return
        }

        setLoading(true)
        const cleanEmail = email.trim().toLowerCase()
        try {
            await login(cleanEmail, password)
            navigate('/home')
        } catch (err) {
            setError(err.message || 'שגיאה בהתחברות')
        } finally {
            setLoading(false)
        }
    }



    return (
        <>

            <h1>login</h1>
            {error && (
                <div className="auth-error">
                    {error}
                </div>
            )}            <form onSubmit={handleSubmit} className="auth-form">
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
                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? (
                        <>
                            מתחבר...
                        </>
                    ) : (
                        " התחבר"
                    )}
                </button>
            </form>
            <Link to="/register">
                להרשמה
            </Link>

        </>

    )
}
export default Login