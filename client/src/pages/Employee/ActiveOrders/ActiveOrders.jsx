import { useEffect, useState, useCallback } from 'react';
import { getMyActiveOrders, updateMyOrderStatus } from '../../../api/employeeApi';

const STATUS_LABELS = {
    confirmed: 'אושרה',
    preparing: 'בהכנה',
    ready:     'מוכנה',
    delivered: 'נמסרה',
    cancelled: 'בוטלה',
};

const NEXT_STEP = {
    confirmed: { status: 'preparing', label: 'התחל הכנה',  btnClass: 'ep-btn--prepare' },
    preparing: { status: 'ready',     label: 'סמן כמוכן',  btnClass: 'ep-btn--ready'   },
    ready:     { status: 'delivered', label: 'אשר מסירה',  btnClass: 'ep-btn--deliver' },
};

function formatDate(d) {
    return new Date(d).toLocaleString('he-IL', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

export default function ActiveOrders() {
    const [orders, setOrders]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [updating, setUpdating] = useState(null);

    const load = useCallback(() => {
        getMyActiveOrders()
            .then(setOrders)
            .catch(() => setError('שגיאה בטעינת ההזמנות'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 20_000);
        return () => clearInterval(interval);
    }, [load]);

    async function handleAdvance(orderId, newStatus) {
        setUpdating(orderId);
        try {
            await updateMyOrderStatus(orderId, newStatus);
            if (newStatus === 'delivered' || newStatus === 'cancelled') {
                setOrders(prev => prev.filter(o => o.id !== orderId));
            } else {
                setOrders(prev =>
                    prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
                );
            }
        } catch (err) {
            alert(err.message || 'שגיאה בעדכון הסטטוס');
        } finally {
            setUpdating(null);
        }
    }

    if (loading) return <div className="ep-loading">טוען הזמנות...</div>;
    if (error)   return <div className="ep-error">{error}</div>;

    return (
        <div className="ep-page">
            <div className="ep-header-row">
                <h1 className="ep-title">
                    ההזמנות שלי
                    <span className="ep-count">({orders.length})</span>
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="ep-empty">
                    <span className="ep-empty-icon">📭</span>
                    <p>אין לך הזמנות פעילות כרגע</p>
                    <p className="ep-empty-sub">עבור ל"הזמנות ממתינות" כדי לקחת הזמנה חדשה</p>
                </div>
            ) : (
                <div className="ep-orders-grid">
                    {orders.map((order, i) => {
                        const next = NEXT_STEP[order.status];
                        return (
                            <div
                                key={order.id}
                                className={`ep-order-card ep-order-card--${order.status}`}
                                style={{ animationDelay: `${i * 0.07}s` }}
                            >
                                <div className="ep-order-card__header">
                                    <span className="ep-order-card__id">הזמנה #{order.id}</span>
                                    <span className={`status-badge status-badge--${order.status}`}>
                                        {STATUS_LABELS[order.status]}
                                    </span>
                                </div>

                                <div className="ep-order-card__customer">
                                    👤 {order.customer_name}
                                </div>

                                <div className="ep-order-card__meta">
                                    <span>📞 {order.phone}</span>
                                    <span>📍 {order.delivery_address}</span>
                                    <span>🕐 {formatDate(order.created_at)}</span>
                                </div>

                                <div className="ep-order-card__items">
                                    {order.items?.map(item => (
                                        <div key={item.id} className="ep-order-item">
                                            <span className="ep-order-item__name">{item.name}</span>
                                            <span className="ep-order-item__qty">x{item.quantity}</span>
                                            <span>₪{Number(item.price_at_order).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {order.items?.some(i => i.special_instructions) && (
                                        <div className="ep-order-item__note">
                                            📝 {order.items.find(i => i.special_instructions)?.special_instructions}
                                        </div>
                                    )}
                                </div>

                                <div className="ep-order-card__footer">
                                    <span className="ep-order-card__total">
                                        ₪{Number(order.total_price).toFixed(2)}
                                    </span>
                                    <div className="ep-order-card__actions">
                                        {order.status !== 'ready' && (
                                            <button
                                                className="ep-btn ep-btn--cancel"
                                                disabled={updating === order.id}
                                                onClick={() => {
                                                    if (window.confirm('לבטל הזמנה זו?'))
                                                        handleAdvance(order.id, 'cancelled');
                                                }}
                                            >
                                                בטל
                                            </button>
                                        )}
                                        {next && (
                                            <button
                                                className={`ep-btn ${next.btnClass}`}
                                                disabled={updating === order.id}
                                                onClick={() => handleAdvance(order.id, next.status)}
                                            >
                                                {updating === order.id ? '...' : next.label}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
