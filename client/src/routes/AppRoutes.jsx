import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import Home from "../pages/Customer/Home/Home";
import CustomerLayout from "../layouts/CustomerLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route element={
                <ProtectedRoute>
                    <CustomerLayout />
                </ProtectedRoute>
            }>
                <Route path="/home" element={<Home />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;