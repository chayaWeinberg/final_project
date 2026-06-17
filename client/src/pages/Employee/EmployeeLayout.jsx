import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { getUser } from '../../utils/authStorage';
import './EmployeeLayout.css';

const NAV_ITEMS = [
    { to: '/employee',         label: 'סקירה כללית',      icon: '/image/dashbord.png', end: true },
    { to: '/employee/pending', label: 'הזמנות ממתינות',  icon: '/image/orders.png' },
    { to: '/employee/active',  label: 'ההזמנות שלי',      icon: '/image/order.png' },
    { to: '/employee/history', label: 'היסטוריה',          icon: '/image/pay.png' },
];

function EmployeeLayout() {
    const navigate  = useNavigate();
    const user      = getUser();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="emp-shell">
            <aside className="emp-sidebar">
                <div className="emp-sidebar__brand">
                    <div className="emp-avatar-wrap">
                        <img src="/image/employee.png" alt="עובד" className="emp-avatar-img" />
                    </div>
                    <span className="emp-sidebar__title">פאנל עובד</span>
                    <span className="emp-sidebar__name">{user?.name || 'עובד'}</span>
                </div>

                <nav className="emp-sidebar__nav">
                    {NAV_ITEMS.map(({ to, label, icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `emp-nav-item${isActive ? ' emp-nav-item--active' : ''}`
                            }
                        >
                            <img src={icon} alt={label} className="emp-nav-item__icon" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button className="emp-sidebar__logout" onClick={handleLogout}>
                    <span>יציאה</span>
                </button>
            </aside>

            <main className="emp-main">
                <Outlet />
            </main>
        </div>
    );
}

export default EmployeeLayout;
