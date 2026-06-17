import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../../api/ordersApi';
import './AdminOrders.css';

const STATUS_LABELS = {
    pending:   'ממתינה',
    confirmed: 'אושרה',
    preparing: 'בהכנה',
    ready:     'מוכנה',
    delivered: 'נמסרה',
    cancelled: 'בוטלה',
};

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

function statusBadgeClass(status) {
    return `status-badge status-badge--${status}`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('he-IL', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        getAllOrders()
            .then(setOrders)
            .catch(() => setError('שגיאה בטעינת ההזמנות'))
            .finally(() => setLoading(false));
    }, []);

    async function handleStatusChange(orderId, newStatus) {
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        } catch {
            alert('שגיאה בעדכון הסטטוס');
        } finally {
            setUpdating(null);
        }
    }

    const filtered = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const counts = STATUS_ORDER.reduce((acc, s) => {
        acc[s] = orders.filter(o => o.status === s).length;
        return acc;
    }, {});

    if (loading) return <div className="ao-loading">טוען הזמנות...</div>;
    if (error)   return <div className="ao-error">{error}</div>;

    return (
        <div className="admin-orders">
            <h1 className="admin-orders__title">ניהול הזמנות</h1>
            <div className="ao-filters">
                <button
                    className={`ao-filter${filter === 'all' ? ' ao-filter--active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    הכל <span className="ao-filter__count">{orders.length}</span>
                </button>
                {STATUS_ORDER.map(s => (
                    <button
                        key={s}
                        className={`ao-filter ao-filter--${s}${filter === s ? ' ao-filter--active' : ''}`}
                        onClick={() => setFilter(s)}
                    >
                        {STATUS_LABELS[s]}
                        {counts[s] > 0 && (
                            <span className="ao-filter__count">{counts[s]}</span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p className="ao-empty">אין הזמנות בסטטוס זה</p>
            ) : (
                <div className="ao-table-wrap">
                    <table className="ao-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>לקוח</th>
                                <th>טלפון</th>
                                <th>סכום</th>
                                <th>סטטוס</th>
                                <th>עובד מטפל</th>
                                <th>תאריך</th>
                                <th>פרטים</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(order => (
                                <>
                                    <tr key={order.id} className="ao-row">
                                        <td className="ao-id">#{order.id}</td>
                                        <td>{order.customer_name || order.user_id}</td>
                                        <td dir="ltr">{order.phone}</td>
                                        <td className="ao-price">₪{Number(order.total_price).toFixed(2)}</td>
                                        <td>
                                            <select
                                                className={statusBadgeClass(order.status)}
                                                value={order.status}
                                                disabled={updating === order.id}
                                                onChange={e => handleStatusChange(order.id, e.target.value)}
                                            >
                                                {STATUS_ORDER.map(s => (
                                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            {order.employee_name
                                                ? <span className="ao-employee">👨‍🍳 {order.employee_name}</span>
                                                : <span className="ao-employee ao-employee--none">—</span>
                                            }
                                        </td>
                                        <td className="ao-date">{formatDate(order.created_at)}</td>
                                        <td>
                                            <button
                                                className="ao-expand-btn"
                                                onClick={() => setExpandedId(
                                                    expandedId === order.id ? null : order.id
                                                )}
                                            >
                                                {expandedId === order.id ? '▲' : '▼'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedId === order.id && (
                                        <tr key={`${order.id}-expanded`} className="ao-expanded">
                                            <td colSpan={8}>
                                                <div className="ao-details">
                                                    <div className="ao-details__address">
                                                        <strong>כתובת:</strong> {order.delivery_address}
                                                    </div>
                                                    <table className="ao-items-table">
                                                        <thead>
                                                            <tr>
                                                                <th>פריט</th>
                                                                <th>כמות</th>
                                                                <th>מחיר ביחידה</th>
                                                                <th>הערות</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items?.map(item => (
                                                                <tr key={item.id}>
                                                                    <td>{item.name}</td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>₪{Number(item.price_at_order).toFixed(2)}</td>
                                                                    <td className="ao-notes">{item.special_instructions || '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
