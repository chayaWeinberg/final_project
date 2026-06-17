import React from "react";
import { Outlet } from "react-router-dom";
import CustomerNavbar from "../pages/Customer/CustomerNavbar";

function CustomerLayout() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--cream)' }}>
            <CustomerNavbar />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
        </div>
    );
}

export default CustomerLayout;
