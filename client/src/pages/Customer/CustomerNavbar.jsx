import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { logout } from "../../api/authApi";
import './CustomerNavbar.css';

function CustomerNavbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="yami-nav">
            <div className="brand">
                <NavLink to="/home" className="logo">
                    <img src="/image/logo.png" alt="יאמי" className="nav-logo-img" />
                </NavLink>
            </div>

            <div className="links">
                <NavLink to="/home" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    🏠 בית
                </NavLink>
                <NavLink to="/menu" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    📋 תפריט
                </NavLink>
                <NavLink to="/create-order" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    🛒 הזמנה חדשה
                </NavLink>
                <NavLink to="/my-orders" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    📦 ההזמנות שלי
                </NavLink>
            </div>

            <div className="actions">
                <button className="logout" onClick={handleLogout}>
                    👋 התנתק
                </button>
            </div>
        </nav>
    );
}

export default CustomerNavbar;
