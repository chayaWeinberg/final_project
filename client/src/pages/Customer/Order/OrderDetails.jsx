import React, { useEffect, useState } from 'react';
import { getOrderById } from '../../../api/orderApi';
import './CreateOrder.css';

export default function OrderDetails({ match, params }) {
    const id = params?.id || match?.params?.id;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const data = await getOrderById(id);
                setOrder(data);
            } catch (err) {
                setError(err.message || 'שגיאה בטעינת הזמנה');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div className="loading">טוען...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="order-details-page">
            <h1>הזמנה #{order.id}</h1>
            <div className="order-meta">
                <div>סטטוס: {order.status}</div>
                <div>טווח זמן: {new Date(order.created_at).toLocaleString('he-IL')}</div>
                <div>מספר טלפון: {order.phone}</div>
                <div>כתובת: {order.delivery_address}</div>
            </div>
            <div className="order-items">
                {order.items.map(item => (
                    <div key={item.id} className="order-item">
                        <div className="name">{item.name}</div>
                        <div className="qty">x{item.quantity}</div>
                        <div className="price">₪{item.price_at_order}</div>
                    </div>
                ))}
            </div>
            <div className="order-total">סה"כ: ₪{order.total_price}</div>
        </div>
    );
}
