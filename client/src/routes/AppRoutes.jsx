import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import Home from "../pages/Customer/Home/Home";
import CustomerLayout from "../layouts/CustomerLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminWelcome from "../pages/Admin/Welcome/AdminWelcome";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import AdminOrders from "../pages/Admin/Orders/AdminOrders";
import AdminMenu from "../pages/Admin/Menu/AdminMenu";
import AdminEmployees from "../pages/Admin/Employees/AdminEmployees";
import Menu from "../pages/Customer/Menu/Menu";
import CreateOrder from "../pages/Customer/Order/CreateOrder";
import MyOrders from "../pages/Customer/Order/MyOrders";
import PaymentPage from "../pages/Customer/Payment/PaymentPage";
import EmployeeLayout from "../pages/Employee/EmployeeLayout";
import EmployeeWelcome from "../pages/Employee/Welcome/EmployeeWelcome";
import EmployeeDashboard from "../pages/Employee/Dashboard/EmployeeDashboard";
import PendingOrders from "../pages/Employee/PendingOrders/PendingOrders";
import ActiveOrders from "../pages/Employee/ActiveOrders/ActiveOrders";
import OrderHistory from "../pages/Employee/History/OrderHistory";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Customer routes */}
            <Route element={
                <ProtectedRoute requiredRole="customer">
                    <CustomerLayout />
                </ProtectedRoute>
            }>
                <Route path="/home" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/create-order" element={<CreateOrder />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/payment" element={<PaymentPage />} />
            </Route>

            {/* Admin welcome splash */}
            <Route path="/admin-welcome" element={
                <ProtectedRoute requiredRole="admin">
                    <AdminWelcome />
                </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="employees" element={<AdminEmployees />} />
            </Route>

            {/* Employee welcome splash */}
            <Route path="/employee-welcome" element={
                <ProtectedRoute requiredRole="employee">
                    <EmployeeWelcome />
                </ProtectedRoute>
            } />

            {/* Employee routes */}
            <Route path="/employee" element={
                <ProtectedRoute requiredRole="employee">
                    <EmployeeLayout />
                </ProtectedRoute>
            }>
                <Route index element={<EmployeeDashboard />} />
                <Route path="pending" element={<PendingOrders />} />
                <Route path="active" element={<ActiveOrders />} />
                <Route path="history" element={<OrderHistory />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
