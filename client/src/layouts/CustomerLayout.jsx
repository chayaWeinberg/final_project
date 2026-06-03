import React from "react";
import { Outlet } from "react-router-dom";
import CustomerNavbar from "../pages/Customer/CustomerNavbar";
function CustomerLayout() {
    return (
        <div>
            CustomerLayout
            <CustomerNavbar />
            <Outlet />

        </div>
    )
}
export default CustomerLayout;