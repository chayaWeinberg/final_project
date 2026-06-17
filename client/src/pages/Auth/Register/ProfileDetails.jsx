import React from "react";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../../api/authApi'
import { saveUser } from '../../../utils/authStorage'
import './ProfileDetails.css'

function ProfileDetails({ basicData, onBack }) {
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
    const [validations, setValidations] = useState({
        name: false,
        phone: false,
        city: false,
        street: false,
        buildingNumber: false
    })

    const validateName = (name) => name.trim().length >= 2 && name.trim().length <= 50;
    const validatePhone = (phone) => /^\d{9,15}$/.test(phone);
    const validateCity = (city) => city.trim().length >= 2;
    const validateStreet = (street) => street.trim().length >= 2;
    const validateBuildingNumber = (num) => num && !isNaN(num) && parseInt(num) > 0;

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        setValidations(prev => ({ ...prev, name: validateName(newName) }));
    }

    const handlePhoneChange = (e) => {
        const newPhone = e.target.value;
        setPhone(newPhone);
        setValidations(prev => ({ ...prev, phone: !newPhone || validatePhone(newPhone) }));
    }

    const handleCityChange = (e) => {
        const newCity = e.target.value;
        setCity(newCity);
        setValidations(prev => ({ ...prev, city: validateCity(newCity) }));
    }

    const handleStreetChange = (e) => {
        const newStreet = e.target.value;
        setStreet(newStreet);
        setValidations(prev => ({ ...prev, street: validateStreet(newStreet) }));
    }

    const handleBuildingNumberChange = (e) => {
        const newBuildingNumber = e.target.value;
        setBuildingNumber(newBuildingNumber);
        setValidations(prev => ({ ...prev, buildingNumber: validateBuildingNumber(newBuildingNumber) }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        
        if (!name || !city || !street || !buildingNumber) {
            setError("׳׳ ׳ ׳׳׳ ׳׳× ׳›׳ ׳”׳©׳“׳•׳× ׳”׳ ׳“׳¨׳©׳™׳")
            return
        }

        if (!validations.name || !validations.city || !validations.street || !validations.buildingNumber) {
            setError("׳׳ ׳ ׳×׳§׳ ׳׳× ׳”׳©׳“׳•׳× ׳”׳׳¡׳•׳׳ ׳™׳ ׳‘׳׳“׳•׳")
            return
        }

        setLoading(true)
        try {
            const data = await register({
                ...basicData,
                name: name.trim(),
                phone: phone.trim(),
                city: city.trim(),
                street: street.trim(),
                buildingNumber: parseInt(buildingNumber),
                floor: floor ? parseInt(floor) : null,
                apartmentNumber: apartmentNumber ? parseInt(apartmentNumber) : null
            })
            saveUser(data.user)
            navigate('/home')
        } catch (err) {
            setError(err.message || "׳©׳’׳™׳׳” ׳‘׳”׳¨׳©׳׳”")
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = validations.name && validations.city && validations.street && 
                       validations.buildingNumber && validations.phone;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card__brand">
                    <img src="/image/logo.png" alt="׳™׳׳׳™" className="auth-card__logo" />
                    <div className="auth-card__brand-text">
                        <span>׳”׳©׳׳׳× ׳₪׳¨׳˜׳™׳</span>
                        <p>׳”׳–׳ ׳׳× ׳”׳›׳×׳•׳‘׳× ׳©׳׳ ׳•׳™׳“׳ ׳©׳”׳”׳–׳׳ ׳•׳× ׳׳’׳™׳¢׳•׳× ׳‘׳“׳™׳•׳§ ׳׳׳™׳™׳.</p>
                    </div>
                </div>
                <p className="profile-subtitle">׳©׳׳‘ ׳©׳ ׳™: ׳₪׳¨׳˜׳™ ׳”׳›׳×׳•׳‘׳× ׳©׳׳</p>
                
                {error && (
                    <div className="auth-error">
                        <svg className="auth-error__icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-section">
                        <h2 className="auth-section-title">׳₪׳¨׳˜׳™׳ ׳׳™׳©׳™׳™׳</h2>
                        
                        <div className="auth-field">
                            <label className="auth-label">
                                <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                ׳©׳ ׳׳׳
                                <span className="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="׳©׳ ׳׳׳.." 
                                value={name} 
                                onChange={handleNameChange} 
                                className={`auth-input ${name ? (validations.name ? 'valid' : 'invalid') : ''}`}
                                disabled={loading} 
                                required
                            />
                            {name && (
                                <small className={`validation-hint ${validations.name ? 'valid' : 'invalid'}`}>
                                    {validations.name ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                            ׳©׳ ׳×׳§׳™׳
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                            </svg>
                                            2-50 ׳×׳•׳•׳™׳
                                        </>
                                    )}
                                </small>
                            )}
                        </div>
                        
                        <div className="auth-field">
                            <label className="auth-label">
                                <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                ׳˜׳׳₪׳•׳
                            </label>
                            <input 
                                type="tel" 
                                placeholder="׳‘׳׳™ ׳¨׳•׳•׳—׳™׳ ׳׳• ׳׳§׳₪׳™׳" 
                                value={phone} 
                                onChange={handlePhoneChange} 
                                className={`auth-input ${phone ? (validations.phone ? 'valid' : 'invalid') : ''}`}
                                disabled={loading}
                                dir="ltr"
                            />
                            {phone && (
                                <small className={`validation-hint ${validations.phone ? 'valid' : 'invalid'}`}>
                                    {validations.phone ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                            ׳˜׳׳₪׳•׳ ׳×׳§׳™׳
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                            </svg>
                                            9-15 ׳¡׳₪׳¨׳•׳×
                                        </>
                                    )}
                                </small>
                            )}
                        </div>
                    </div>
                    
                    <div className="auth-section">
                        <h2 className="auth-section-title">׳›׳×׳•׳‘׳×</h2>
                        
                        <div className="auth-field">
                            <label className="auth-label">
                                <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                ׳¢׳™׳¨
                                <span className="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="׳¢׳™׳¨.." 
                                value={city} 
                                onChange={handleCityChange} 
                                className={`auth-input ${city ? (validations.city ? 'valid' : 'invalid') : ''}`}
                                disabled={loading} 
                                required
                            />
                            {city && (
                                <small className={`validation-hint ${validations.city ? 'valid' : 'invalid'}`}>
                                    {validations.city ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                            ׳¢׳™׳¨ ׳×׳§׳™׳ ׳”
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                            </svg>
                                            ׳׳₪׳—׳•׳× 2 ׳×׳•׳•׳™׳
                                        </>
                                    )}
                                </small>
                            )}
                        </div>
                        
                        <div className="auth-field">
                            <label className="auth-label">
                                <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9l6-7 6 7M9 10v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V10M9 14h6"/>
                                </svg>
                                ׳¨׳—׳•׳‘
                                <span className="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="׳¨׳—׳•׳‘.." 
                                value={street} 
                                onChange={handleStreetChange} 
                                className={`auth-input ${street ? (validations.street ? 'valid' : 'invalid') : ''}`}
                                disabled={loading} 
                                required
                            />
                            {street && (
                                <small className={`validation-hint ${validations.street ? 'valid' : 'invalid'}`}>
                                    {validations.street ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                            ׳¨׳—׳•׳‘ ׳×׳§׳™׳
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                            </svg>
                                            ׳׳₪׳—׳•׳× 2 ׳×׳•׳•׳™׳
                                        </>
                                    )}
                                </small>
                            )}
                        </div>
                        
                        <div className="auth-row">
                            <div className="auth-field">
                                <label className="auth-label">
                                    <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        <polyline points="9 22 9 12 15 12 15 22"/>
                                    </svg>
                                    ׳׳¡׳₪׳¨ ׳‘׳ ׳™׳™׳
                                    <span className="required">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    placeholder="׳׳¡׳₪׳¨ ׳‘׳ ׳™׳™׳.." 
                                    value={buildingNumber} 
                                    onChange={handleBuildingNumberChange} 
                                    className={`auth-input ${buildingNumber ? (validations.buildingNumber ? 'valid' : 'invalid') : ''}`}
                                    disabled={loading} 
                                    min="1"
                                    required
                                    dir="ltr"
                                />
                                {buildingNumber && (
                                    <small className={`validation-hint ${validations.buildingNumber ? 'valid' : 'invalid'}`}>
                                        {validations.buildingNumber ? (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                </svg>
                                                ׳׳¡׳₪׳¨ ׳×׳§׳™׳
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                                </svg>
                                                ׳׳¡׳₪׳¨ ׳—׳™׳•׳‘׳™
                                            </>
                                        )}
                                    </small>
                                )}
                            </div>
                            
                            <div className="auth-field">
                                <label className="auth-label">
                                    <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                    </svg>
                                    ׳§׳•׳׳”
                                </label>
                                <input 
                                    type="number" 
                                    placeholder="׳§׳•׳׳”" 
                                    value={floor} 
                                    onChange={(e) => setFloor(e.target.value)} 
                                    className="auth-input" 
                                    disabled={loading} 
                                    min="0"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        
                        <div className="auth-field">
                            <label className="auth-label">
                                <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                ׳׳¡׳₪׳¨ ׳“׳™׳¨׳”
                            </label>
                            <input 
                                type="number" 
                                placeholder="׳׳¡׳₪׳¨ ׳“׳™׳¨׳”" 
                                value={apartmentNumber} 
                                onChange={(e) => setApartmentNumber(e.target.value)} 
                                className="auth-input" 
                                disabled={loading} 
                                min="1"
                                dir="ltr"
                            />
                        </div>
                    </div>
                    
                    <div className="auth-button-group">
                        {onBack && (
                            <button 
                                type="button" 
                                onClick={onBack} 
                                className="auth-back" 
                                disabled={loading}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="19" y1="12" x2="5" y2="12"/>
                                    <polyline points="12 19 5 12 12 5"/>
                                </svg>
                                ׳—׳–׳¨׳”
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className="auth-submit" 
                            disabled={loading || !isFormValid}
                        >
                            {loading ? '׳ ׳¨׳©׳...' : '׳¡׳™׳™׳ ׳”׳¨׳©׳׳”'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProfileDetails

