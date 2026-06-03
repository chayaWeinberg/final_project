import React from "react";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../../api/authApi'
function ProfileDetails({ basicData }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [city, setCity] = useState("")
    const [street, setStreet] = useState("")
    const [buildingNumber, setBuildingNumber] = useState("")
    const [floor, setFloor] = useState("")
    const [apartmentNumber, setApartmentNumber] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            await register({
                ...basicData,
                name,
                phone,
                city,
                street,
                buildingNumber,
                floor,
                apartmentNumber
            })
            navigate('/home')
        } catch (err) {
            setError(err.message || "שגיאה בהרשמה")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>פרטים אישיים </label>
                    <input
                        type="text"
                        placeholder=" שם ..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="auth-input"
                        disabled={loading}
                    />
                   
                    <input
                        type="text"
                        placeholder="טלפון..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="auth-input"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>כתובת</label>
                    <input
                        type="text"
                        placeholder="עיר..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="auth-input"
                        disabled={loading}
                    />
                    <input
                        type="text"
                        placeholder="רחוב..."
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="auth-input"
                        disabled={loading}
                    />
                    <input
                        type="number"
                        placeholder="מספר בניין..."
                        value={buildingNumber}
                        onChange={(e) => setBuildingNumber(e.target.value)}
                        className="auth-input"
                        disabled={loading}
                    />
                    <input
                        type="number"
                        placeholder="קומה..."
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        className="auth-input"
                        disabled={loading}
                    />
                    <input
                        type="number"
                        placeholder="מספר דירה..."
                        value={apartmentNumber}
                        onChange={(e) => setApartmentNumber(e.target.value)}
                        className="auth-input"
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            נרשם...
                        </>
                    ) : (
                        "להרשמה"
                    )}
                </button>
            </form>
        </>
    )
}

export default ProfileDetails