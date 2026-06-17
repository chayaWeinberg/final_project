import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems } from '../../../api/menuApi';
import CartSidebar from '../../../components/CartSidebar';
import './CreateOrder.css';

const CATEGORY_ORDER = ['starters', 'mains', 'salads', 'drinks', 'desserts'];
const CATEGORY_LABELS = {
  starters: 'ראשונות',
  mains:    'עיקריות',
  salads:   'סלטים',
  drinks:   'שתייה',
  desserts: 'מתוקים',
};
const CATEGORY_EMOJI = {
  starters: '🥗',
  mains:    '🍝',
  salads:   '🥙',
  drinks:   '🥤',
  desserts: '🍰',
};
const CATEGORY_IMG = {
  starters: '/image/first.jpg',
  mains:    '/image/cat-mains.jpg',
  salads:   '/image/cat-salads.jpg',
  drinks:   '/image/cat-drinks.jpg',
  desserts: '/image/cat-desserts.jpg',
};

function CreateOrder() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('הכל');
  const [cartOpen, setCartOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllItems();
        setMenu(data);
      } catch (err) {
        setError('שגיאה בטעינת התפריט');
      } finally {
        setMenuLoading(false);
      }
    })();
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const found = prev.find(i => i.id === item.id);
      if (found) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const changeQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const cartCount = cart.reduce((s, it) => s + it.quantity, 0);

  const existingCats = CATEGORY_ORDER.filter(c => menu.some(i => i.category === c));
  const categories = ['הכל', 'להיטים', ...existingCats];

  const filtered = menu.filter(item => {
    if (activeCategory === 'הכל') return true;
    if (activeCategory === 'להיטים') return item.is_hit === 1;
    return item.category === activeCategory;
  });

  const handleCheckout = async () => {
    setError('');
    if (cart.length === 0) return setError('העגלה ריקה');
    if (!deliveryAddress || !phone) return setError('אנא מלא את כתובת המשלוח ומספר הטלפון');
    navigate('/payment', { state: { cart, deliveryAddress, phone, total } });
  };

  return (
    <div className={`co-page ${cartOpen ? 'cart-is-open' : ''}`}>

      {/* ── Hero Banner ── */}
      <div className="co-hero">
        <img src="/image/logo.png" alt="יאמי" className="co-hero__logo" />
        <h1 className="co-hero__title">בניית ההזמנה שלך</h1>
        <p className="co-hero__sub">בחר מנות, מלא פרטים ואנחנו נדאג לשאר 🍽️</p>
      </div>

      <div className="co-body">

        {/* ── Menu Column ── */}
        <div className="co-menu-col">

          {/* Category Tabs */}
          <div className="co-cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`co-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'הכל'    && <span className="co-cat-emoji">🍴</span>}
                {cat === 'להיטים' && <span className="co-cat-emoji">⭐</span>}
                {existingCats.includes(cat) && (
                  CATEGORY_IMG[cat]
                    ? <img src={CATEGORY_IMG[cat]} alt={CATEGORY_LABELS[cat]} className="co-cat-img" />
                    : <span className="co-cat-emoji">{CATEGORY_EMOJI[cat]}</span>
                )}
                <span>{CATEGORY_LABELS[cat] ?? cat}</span>
              </button>
            ))}
          </div>

          {/* Items count */}
          <p className="co-count">
            מציג <strong>{filtered.length}</strong> מנות
          </p>

          {/* Grid */}
          {menuLoading ? (
            <div className="co-loading">
              <span className="co-spinner">🍽️</span>
              <p>טוען תפריט...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="co-empty">😕 לא נמצאו מנות בקטגוריה זו</div>
          ) : (
            <div className="co-grid">
              {filtered.map(item => {
                const inCart = cart.find(i => i.id === item.id);
                return (
                  <div key={item.id} className={`co-card ${inCart ? 'in-cart' : ''}`}>
                    {item.is_hit === 1 && <span className="co-hit-badge">⭐ להיט</span>}

                    {/* Card image */}
                    <div className="co-card__img">
                      {CATEGORY_IMG[item.category] ? (
                        <img src={CATEGORY_IMG[item.category]} alt={item.name} />
                      ) : (
                        <span className="co-card__emoji">{CATEGORY_EMOJI[item.category] || '🍽️'}</span>
                      )}
                    </div>

                    <div className="co-card__body">
                      <h3 className="co-card__name">{item.name}</h3>
                      <p className="co-card__desc">{item.description}</p>
                      <div className="co-card__footer">
                        <span className="co-card__price">₪{item.price}</span>
                        {inCart ? (
                          <div className="co-card__qty-controls">
                            <button
                              className="co-qty-btn"
                              onClick={() => changeQty(item.id, inCart.quantity - 1)}
                            >−</button>
                            <span className="co-qty-val">{inCart.quantity}</span>
                            <button
                              className="co-qty-btn"
                              onClick={() => addToCart(item)}
                            >+</button>
                          </div>
                        ) : (
                          <button className="co-add-btn" onClick={() => addToCart(item)}>
                            + הוסף
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

        {/* ── Side Column: form + cart ── */}
        <div className="co-side-col">

          {/* Delivery form */}
          <div className="co-delivery-form">
            <h2 className="co-form-title">📍 פרטי משלוח</h2>

            {error && <div className="co-error">{error}</div>}

            <div className="co-form-group">
              <label className="co-label" htmlFor="co-address">כתובת למשלוח</label>
              <input
                id="co-address"
                className="co-input"
                type="text"
                placeholder="רחוב, מספר, עיר"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
              />
            </div>

            <div className="co-form-group">
              <label className="co-label" htmlFor="co-phone">מספר טלפון</label>
              <input
                id="co-phone"
                className="co-input"
                type="tel"
                placeholder="050-000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Cart */}
          <CartSidebar
            cart={cart}
            onRemove={removeFromCart}
            onChangeQty={changeQty}
            onCheckout={handleCheckout}
            total={total}
          />
        </div>
      </div>

      {/* ── Mobile floating cart button ── */}
      {cartCount > 0 && (
        <button
          className="co-fab"
          onClick={() => setCartOpen(o => !o)}
          aria-label="פתח עגלה"
        >
          🛒
          <span className="co-fab__count">{cartCount}</span>
          <span className="co-fab__total">₪{total.toFixed(0)}</span>
        </button>
      )}
    </div>
  );
}

export default CreateOrder;
