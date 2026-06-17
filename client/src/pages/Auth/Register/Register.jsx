import React, { useState } from 'react'
import ProfileDetails from '../Register/ProfileDetails' 
import SignupCredentials from '../Register/SignupCredentials'
import { Link } from "react-router-dom";

function Register() {
    const [step, setStep] = useState(1)
    const [basicData, setBasicData] = useState({ email: '', password: '' })

    const handleBasicSubmit = (data) => {
        setBasicData(data)
        setStep(2)
    }

    const handleBack = () => {
        setStep(1)
    }

    return (
        <>
            {step === 1 && (
                <SignupCredentials 
                    onSubmit={handleBasicSubmit}
                />
            )}
            {step === 2 && (
                <ProfileDetails 
                    
                    basicData={basicData}
                    onBack={handleBack}
                />
            )}
             <Link to="/login" className="auth-link">
                כבר יש לך חשבון? להתחברות
            </Link>
        </>
    )
}

export default Register