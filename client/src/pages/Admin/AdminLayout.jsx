import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import './AdminLayout.css';

const NAV_ITEMS = [
    { to: '/admin',           label: 'סקירה כללית', icon: '/image/dashbord.png', end: true },
    { to: '/admin/orders',    label: 'הזמנות',       icon: '/image/orders.png' },
    { to: '/admin/menu',      label: 'תפריט',         icon: '/image/menu.png' },
    { to: '/admin/employees', label: 'עובדים',        icon: '/image/order.png' },
];

function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__brand">
                    <img src="/image/admin-avatar.png" alt="מנהל" className="admin-sidebar__avatar" />
                    <span className="admin-sidebar__title">פאנל ניהול</span>
                </div>
                <nav className="admin-sidebar__nav">
                    {NAV_ITEMS.map(({ to, label, icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`
                            }
                        >
                            <img
                                src={icon}
                                alt={label}
                                className="admin-nav-item__icon"
                            />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <button className="admin-sidebar__logout" onClick={handleLogout}>
                    <span>יציאה</span>
                </button>
            </aside>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
