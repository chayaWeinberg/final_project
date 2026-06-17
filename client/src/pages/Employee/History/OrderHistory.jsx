import { useEffect, useState } from 'react';
import { getMyOrderHistory } from '../../../api/employeeApi';

const STATUS_LABELS = {
    delivered: 'נמסרה',
    cancelled: 'בוטלה',
};

function formatDate(d) {
    return new Date(d).toLocaleString('he-IL', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

export default function OrderHistory() {
    const [orders, setOrders]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        getMyOrderHistory()
            .then(setOrders)
            .catch(() => setError('שגיאה בטעינת ההיסטוריה'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="ep-loading">טוען היסטוריה...</div>;
    if (error)   return <div className="ep-error">{error}</div>;

    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;

    return (
        <div className="ep-page">
            <h1 className="ep-title">היסטוריית הזמנות</h1>

            <div className="ep-kpi-row">
                <div className="ep-kpi">
                    <span className="ep-kpi__label">נמסרו</span>
                    <span className="ep-kpi__value" style={{ color: 'var(--brown)' }}>{delivered}</span>
                </div>
                <div className="ep-kpi">
                    <span className="ep-kpi__label">בוטלו</span>
                    <span className="ep-kpi__value" style={{ color: '#c0392b' }}>{cancelled}</span>
                </div>
                <div className="ep-kpi">
                    <span className="ep-kpi__label">סה"כ</span>
                    <span className="ep-kpi__value">{orders.length}</span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="ep-empty">
                    <span className="ep-empty-icon">📭</span>
                    <p>אין היסטוריה עדיין</p>
                </div>
            ) : (
                <div className="ep-history-table-wrap">
                    <table className="ep-history-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>לקוח</th>
                                <th>סכום</th>
                                <th>סטטוס</th>
                                <th>תאריך</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <>
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--brown-light)' }}>
                                            #{order.id}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--brown)' }}>
                                            ₪{Number(order.total_price).toFixed(2)}
                                        </td>
                                        <td>
                                            <span className={`status-badge status-badge--${order.status}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {formatDate(order.updated_at)}
                                        </td>
                                        <td>
                                            <button
                                                className="ep-expand-btn"
                                                onClick={() => setExpandedId(
                                                    expandedId === order.id ? null : order.id
                                                )}
                                            >
                                                {expandedId === order.id ? '▲' : '▼'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedId === order.id && (
                                        <tr key={`${order.id}-exp`} className="ep-expanded-row">
                                            <td colSpan={6}>
                                                <div className="ep-expanded-content">
                                                    <div className="ep-expanded-meta">
                                                        <span>📍 {order.delivery_address}</span>
                                                        <span>📞 {order.phone}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        {order.items?.map(item => (
                                                            <div key={item.id} className="ep-order-item">
                                                                <span className="ep-order-item__name">{item.name}</span>
                                                                <span className="ep-order-item__qty">x{item.quantity}</span>
                                                                <span>₪{Number(item.price_at_order).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
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
