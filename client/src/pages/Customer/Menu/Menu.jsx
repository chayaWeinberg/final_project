import { useState, useEffect } from 'react';
import { getAllItems } from '../../../api/menuApi';
import { downloadMenuPDF } from '../../../utils/pdfExport';
import './Menu.css';

const CATEGORY_ORDER = ['starters', 'mains', 'salads', 'drinks', 'desserts'];

const CATEGORY_LABELS = {
  starters: 'ראשונות',
  mains: 'עיקריות',
  salads: 'סלטים',
  drinks: 'שתייה',
  desserts: 'מתוקים',
};

const CATEGORY_EMOJI = {
  starters: '🥗',
  mains: '🍝',
  salads: '🥙',
  drinks: '🥤',
  desserts: '🍰',
};

const CATEGORY_IMG = {
  starters: '/image/first.jpg' ,                    // עדיין חסר
  mains:    '/image/cat-mains.jpg',
  salads:   '/image/cat-salads.jpg',
  drinks:   '/image/cat-drinks.jpg',
  desserts: '/image/cat-desserts.jpg',
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('הכל');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllItems()
      .then(data => setItems(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const existingCats = CATEGORY_ORDER.filter(c => items.some(i => i.category === c));
  const categories = ['הכל', 'להיטים', ...existingCats];

  const filtered = items.filter(item => {
    if (activeCategory === 'הכל') return true;
    if (activeCategory === 'להיטים') return item.is_hit === 1;
    return item.category === activeCategory;
  });

  if (loading) return (
    <div className="menu-page">
      <div className="menu-header">
        <img src="/image/logo.png" alt="יאמי" className="menu-header-logo" />
        <h1 className="menu-title">התפריט שלנו</h1>
        <p className="menu-subtitle">המנות הכי טעימות בעיר</p>
      </div>
      <div className="menu-loading">
        <span className="loading-spinner">🍽️</span>
        <p>טוען תפריט...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="menu-title">התפריט שלנו</h1>
      </div>
      <div className="menu-error">😕 שגיאה בטעינת התפריט: {error}</div>
    </div>
  );

  return (
    <div className="menu-page">

      {/* Header */}
      <div className="menu-header">
        <img src="/image/logo.png" alt="יאמי" className="menu-header-logo" />
        <h1 className="menu-title">התפריט שלנו</h1>
        <p className="menu-subtitle">המנות הכי טעימות בעיר — טריות, טעימות ומוגשות עם אהבה 💙</p>
        <button
          className="menu-download-btn"
          onClick={() => downloadMenuPDF(items)}
          title="הורד תפריט PDF"
        >
          📄 הורד תפריט
        </button>
      </div>

      <div className="menu-body">

        {/* כפתורי קטגוריה עם תמונות */}
        <div className="menu-categories">
          {/* הכל */}
          <button
            className={`cat-btn ${activeCategory === 'הכל' ? 'active' : ''}`}
            onClick={() => setActiveCategory('הכל')}
          >
            <span className="cat-btn-emoji">🍴</span>
            <span>הכל</span>
          </button>

          {/* להיטים */}
          <button
            className={`cat-btn ${activeCategory === 'להיטים' ? 'active' : ''}`}
            onClick={() => setActiveCategory('להיטים')}
          >
            <span className="cat-btn-emoji"></span>
            <span>להיטים</span>
          </button>

          {/* קטגוריות עם תמונות */}
          {existingCats.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_IMG[cat] ? (
                <img
                  src={CATEGORY_IMG[cat]}
                  alt={CATEGORY_LABELS[cat]}
                  className="cat-btn-img"
                />
              ) : (
                <span className="cat-btn-emoji">{CATEGORY_EMOJI[cat]}</span>
              )}
              <span>{CATEGORY_LABELS[cat]}</span>
            </button>
          ))}
        </div>

        <p className="items-count">
          מציג <strong>{filtered.length}</strong> מנות
        </p>

        {filtered.length === 0 ? (
          <div className="menu-empty">😕 לא נמצאו מנות בקטגוריה זו</div>
        ) : (
          <div className="menu-grid">
            {filtered.map(item => (
              <div key={item.id} className="menu-card">
                {item.is_hit === 1 && <span className="hit-badge"> להיט</span>}

                {/* תמונת כרטיס — תמונת הקטגוריה אם יש */}
                <div className="card-image">
                  {CATEGORY_IMG[item.category] ? (
                    <img
                      src={CATEGORY_IMG[item.category]}
                      alt={item.name}
                      className="card-cat-img"
                    />
                  ) : (
                    <span className="card-emoji">
                      {CATEGORY_EMOJI[item.category] || '🍽️'}
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="card-footer">
                    <span className="category-tag">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    <span className="price">₪{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
