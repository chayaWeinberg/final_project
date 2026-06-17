import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../../../api/orderApi';
import { downloadOrderReceipt } from '../../../utils/pdfExport';
import './MyOrders.css';

const STATUS_LABELS = {
  pending:   { text: 'ממתינה',  icon: '🕐' },
  confirmed: { text: 'אושרה',   icon: '✅' },
  preparing: { text: 'בהכנה',   icon: '👨‍🍳' },
  ready:     { text: 'מוכנה',   icon: '🟢' },
  delivered: { text: 'נמסרה',   icon: '🎉' },
  cancelled: { text: 'בוטלה',   icon: '❌' },
};

function MyOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(err => setError(err.message || 'שגיאה בטעינת הזמנות'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="mo-page">
      <div className="mo-hero">
        <img src="/image/logo.png" alt="יאמי" className="mo-hero__logo" />
        <h1>ההזמנות שלי</h1>
      </div>
      <div className="mo-state">
        <span className="mo-spinner">🍽️</span>
        <p>טוען הזמנות...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="mo-page">
      <div className="mo-hero">
        <img src="/image/logo.png" alt="יאמי" className="mo-hero__logo" />
        <h1>ההזמנות שלי</h1>
      </div>
      <div className="mo-state mo-state--error">😕 {error}</div>
    </div>
  );

  return (
    <div className="mo-page">

      {/* ── Hero ── */}
      <div className="mo-hero">
        <img src="/image/logo.png" alt="יאמי" className="mo-hero__logo" />
        <h1 className="mo-hero__title">ההזמנות שלי</h1>
        <p className="mo-hero__sub">מעקב אחר כל ההזמנות שלך במקום אחד</p>
      </div>

      <div className="mo-body">

        {orders.length === 0 ? (
          <div className="mo-empty">
            <span className="mo-empty__icon">🍽️</span>
            <p className="mo-empty__title">עדיין אין הזמנות</p>
            <p className="mo-empty__sub">הגיע הזמן להזמין משהו טעים!</p>
            <a href="/order" className="mo-cta">הזמן עכשיו ←</a>
          </div>
        ) : (
          <div className="mo-list">
            {orders.map(order => {
              const s = STATUS_LABELS[order.status] || { text: order.status, icon: '•' };
              const isOpen   = expanded === order.id;
              const isActive = ['confirmed', 'preparing', 'ready'].includes(order.status);

              return (
                <div
                  key={order.id}
                  className={`mo-card mo-card--${order.status} ${isActive ? 'mo-card--active' : ''}`}
                >
                  {/* Header row */}
                  <div
                    className="mo-card__header"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    role="button"
                    aria-expanded={isOpen}
                  >
                    <div className="mo-card__meta">
                      <span className="mo-card__id">הזמנה #{order.id}</span>
                      <span className="mo-card__date">
                        {new Date(order.created_at).toLocaleString('he-IL', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="mo-card__summary">
                      <span className={`mo-badge mo-badge--${order.status}`}>
                        {s.icon} {s.text}
                      </span>
                      <span className="mo-card__total">
                        ₪{Number(order.total_price).toFixed(2)}
                      </span>
                      <span className="mo-expand-icon" aria-hidden="true">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Employee banner */}
                  {order.employee_name && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="mo-employee-banner">
                      👨‍🍳 <strong>{order.employee_name}</strong> מטפל בהזמנה שלך
                    </div>
                  )}
                  {order.employee_name && order.status === 'delivered' && (
                    <div className="mo-employee-banner mo-employee-banner--done">
                      ✅ הזמנה הושלמה על ידי <strong>{order.employee_name}</strong>
                    </div>
                  )}

                  {/* Progress bar for active orders */}
                  {isActive && (
                    <div className="mo-progress">
                      {['confirmed', 'preparing', 'ready'].map((st, i) => {
                        const stepIdx   = ['confirmed', 'preparing', 'ready'].indexOf(order.status);
                        const isDone    = stepIdx >= i;
                        const isCurrent = stepIdx === i;
                        return (
                          <React.Fragment key={st}>
                            <div className={`mo-progress__step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                              <div className="mo-progress__dot" />
                              <span>{STATUS_LABELS[st].text}</span>
                            </div>
                            {i < 2 && <div className={`mo-progress__line ${stepIdx > i ? 'done' : ''}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}

                  {/* Expanded body */}
                  {isOpen && (
                    <div className="mo-card__body">
                      <div className="mo-items">
                        {order.items.map(item => (
                          <div key={item.id} className="mo-item">
                            <span className="mo-item__name">{item.name}</span>
                            <span className="mo-item__qty">×{item.quantity}</span>
                            <span className="mo-item__price">
                              ₪{(item.price_at_order * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mo-card__details">
                        <span>📍 {order.delivery_address}</span>
                        <span>📞 {order.phone}</span>
                      </div>

                      <button
                        className="mo-receipt-btn"
                        onClick={() => downloadOrderReceipt(order)}
                      >
                        📄 הורד קבלה
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
