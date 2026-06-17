import { useEffect, useState, useCallback, useRef } from 'react';
import { getPendingOrders, takeOrder } from '../../../api/employeeApi';
import { playNewOrderAlert, playStatusUpdate } from '../../../utils/sounds';

function formatDate(d) {
    return new Date(d).toLocaleString('he-IL', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

export default function PendingOrders() {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [taking, setTaking]   = useState(null);
    const prevCountRef           = useRef(null);

    const load = useCallback(() => {
        setLoading(true);
        getPendingOrders()
            .then(data => {
                setOrders(data);
                // Play alert if new orders arrived since last poll
                if (prevCountRef.current !== null && data.length > prevCountRef.current) {
                    playNewOrderAlert();
                }
                prevCountRef.current = data.length;
            })
            .catch(() => setError('שגיאה בטעינת הזמנות ממתינות'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 30_000);
        return () => clearInterval(interval);
    }, [load]);

    async function handleTake(orderId) {
        setTaking(orderId);
        try {
            await takeOrder(orderId);
            playStatusUpdate();
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (err) {
            alert(err.message || 'שגיאה בלקיחת ההזמנה');
        } finally {
            setTaking(null);
        }
    }

    if (loading) return <div className="ep-loading">טוען הזמנות ממתינות...</div>;
    if (error)   return <div className="ep-error">{error}</div>;

    return (
        <div className="ep-page">
            <div className="ep-header-row">
                <h1 className="ep-title">
                    הזמנות ממתינות
                    <span className="ep-count">({orders.length})</span>
                </h1>
                <button className="ep-refresh-btn" onClick={load}>
                    רענן ↻
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="ep-empty">
                    <span className="ep-empty-icon">✅</span>
                    <p>אין הזמנות ממתינות כרגע</p>
                </div>
            ) : (
                <div className="ep-orders-grid">
                    {orders.map((order, i) => (
                        <div
                            key={order.id}
                            className="ep-order-card ep-order-card--pending"
                            style={{ animationDelay: `${i * 0.07}s` }}
                        >
                            <div className="ep-order-card__header">
                                <span className="ep-order-card__id">הזמנה #{order.id}</span>
                                <span className="status-badge status-badge--pending">ממתינה</span>
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
                                        📝 יש הערות מיוחדות
                                    </div>
                                )}
                            </div>

                            <div className="ep-order-card__footer">
                                <span className="ep-order-card__total">
                                    ₪{Number(order.total_price).toFixed(2)}
                                </span>
                                <button
                                    className="ep-btn ep-btn--take"
                                    disabled={taking === order.id}
                                    onClick={() => handleTake(order.id)}
                                >
                                    {taking === order.id ? 'לוקח...' : 'קח הזמנה ←'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
