import React from 'react';
import './CartSidebar.css';

export default function CartSidebar({ cart, onRemove, onChangeQty, onCheckout, total }) {
  return (
    <aside className="cart-sidebar">

      {/* Header */}
      <div className="cart-sidebar__header">
        <span className="cart-sidebar__icon">🛒</span>
        <h3>העגלה שלי</h3>
        {cart.length > 0 && (
          <span className="cart-sidebar__badge">
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
        )}
      </div>

      {/* Items */}
      {cart.length === 0 ? (
        <div className="cart-empty">
          <span className="cart-empty__icon">🍽️</span>
          <p>העגלה ריקה</p>
          <small>הוסף מנות מהתפריט</small>
        </div>
      ) : (
        <div className="cart-items">
          {cart.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item__info">
                <span className="cart-item__name">{item.name}</span>
                <span className="cart-item__price">₪{(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div className="cart-item__controls">
                <button
                  className="cart-item__qty-btn"
                  onClick={() => onChangeQty(item.id, item.quantity - 1)}
                  aria-label="הפחת כמות"
                >−</button>
                <span className="cart-item__qty">{item.quantity}</span>
                <button
                  className="cart-item__qty-btn"
                  onClick={() => onChangeQty(item.id, item.quantity + 1)}
                  aria-label="הגדל כמות"
                >+</button>
                <button
                  className="cart-item__remove"
                  onClick={() => onRemove(item.id)}
                  aria-label="הסר פריט"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="cart-footer">
        <div className="cart-footer__row">
          <span className="cart-footer__label">סה"כ לתשלום</span>
          <span className="cart-footer__total">₪{total.toFixed(2)}</span>
        </div>
        <button
          className="cart-checkout-btn"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          לתשלום ←
        </button>
      </div>
    </aside>
  );
}
