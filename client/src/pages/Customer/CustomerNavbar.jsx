import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";

function CustomerNavbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <button onClick={handleLogout}>log out</button>
        </>
    );
}

export default CustomerNavbar;