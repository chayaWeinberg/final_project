import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems, getHitItems } from '../../../api/menuApi';
import './Home.css';

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

// תמונות קטגוריות מהבינה מלאכותית
const CATEGORY_IMG = {
  starters: '/image/first.jpg',           // עדיין חסר — צריך ליצור
  mains: '/image/cat-mains.jpg',
  salads: '/image/cat-salads.jpg',
  drinks: '/image/cat-drinks.jpg',
  desserts: '/image/cat-desserts.jpg',
};

const CATEGORY_ORDER = ['starters', 'mains', 'salads', 'drinks', 'desserts'];

function Home() {
  const [hits, setHits] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getHitItems(), getAllItems()])
      .then(([hitData, allData]) => {
        setHits(hitData.slice(0, 4));
        setAllItems(allData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categoryGroups = CATEGORY_ORDER.filter(c =>
    allItems.some(i => i.category === c)
  );

  return (
    <div className="home-wrap">

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-bubbles">
          <span className="bubble b1">🍕</span>
          <span className="bubble b2">🍝</span>
          <span className="bubble b3">🥗</span>
          <span className="bubble b4">🍰</span>
          <span className="bubble b5">🥤</span>
          <span className="bubble b6">🍜</span>
        </div>

        <div className="hero-inner">
          <div className="hero-logo-wrap">
            <img src="/image/logo.png" alt="יאמי" className="hero-logo" />
          </div>
          <div className="hero-content">
            <div className="hero-badge">✨ הטעם הכי טוב בעיר</div>
            <h1 className="hero-title">
              ברוכים הבאים ל
              <span className="hero-brand">יאמי!</span>
            </h1>
            <p className="hero-sub">
              אוכל טרי, טעים ואהוב — מוגש עם אהבה ישירות אליך 🤩
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/create-order')}>
                🛒 הזמן עכשיו
              </button>
              <button className="btn-secondary" onClick={() => navigate('/menu')}>
                📋 לתפריט המלא
              </button>
            </div>
          </div>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
            <path d="M0,35 C480,70 960,0 1440,35 L1440,70 L0,70 Z" fill="#fdf8f0"/>
          </svg>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="stats-bar">
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">4.9</span>
          <span className="stat-label">דירוג לקוחות</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-icon">🍽️</span>
          <span className="stat-value">+50</span>
          <span className="stat-label">מנות בתפריט</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-icon">🚀</span>
          <span className="stat-value">30 דק'</span>
          <span className="stat-label">זמן משלוח ממוצע</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-icon">💛</span>
          <span className="stat-value">+5,000</span>
          <span className="stat-label">לקוחות מרוצים</span>
        </div>
      </section>

      {/* ══ HITS ══ */}
      {!loading && hits.length > 0 && (
        <section className="section hits-section">
          <div className="section-header">
            <span className="section-tag"> הכי פופולרי</span>
            <h2 className="section-title">הלהיטים שלנו</h2>
            <p className="section-sub">הפריטים שכולם מזמינים — אתם חייבים לנסות!</p>
          </div>

          <div className="hits-grid">
            {hits.map(item => (
              <div key={item.id} className="hit-card">
                <div className="hit-img">
                  <span className="hit-emoji">{CATEGORY_EMOJI[item.category] || '🍽️'}</span>
                  <span className="hit-badge-label"> להיט</span>
                </div>
                <div className="hit-body">
                  <h3 className="hit-name">{item.name}</h3>
                  <p className="hit-desc">{item.description}</p>
                  <div className="hit-footer">
                    <span className="hit-price">₪{item.price}</span>
                    <button
                      className="btn-add"
                      onClick={() => navigate('/create-order')}
                    >
                      + הוסף
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ CATEGORIES ══ */}
      <section className="section cats-section">
        <div className="section-header">
          <span className="section-tag">🍴 מה בא לך?</span>
          <h2 className="section-title">קטגוריות התפריט</h2>
        </div>

        <div className="cats-grid">
          {categoryGroups.map(cat => (
            <button
              key={cat}
              className="cat-card"
              onClick={() => navigate('/menu')}
            >
              {CATEGORY_IMG[cat] ? (
                <img
                  src={CATEGORY_IMG[cat]}
                  alt={CATEGORY_LABELS[cat]}
                  className="cat-card-img"
                />
              ) : (
                <span className="cat-emoji-fallback">{CATEGORY_EMOJI[cat]}</span>
              )}
              <span className="cat-name">{CATEGORY_LABELS[cat]}</span>
              <span className="cat-count">
                {allItems.filter(i => i.category === cat).length} מנות
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ══ WHY YAMI ══ */}
      <section className="section why-section">
        <div className="section-header">
          <span className="section-tag">💙 למה יאמי?</span>
          <h2 className="section-title">כי אנחנו שונים</h2>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🌿</div>
            <h3>רכיבים טריים</h3>
            <p>כל יום מגיעים רכיבים טריים ישירות מהשוק — ללא חומרים משמרים</p>
          </div>
          <div className="why-card">
            <div className="why-icon">👨‍🍳</div>
            <h3>שפים מקצועיים</h3>
            <p>הצוות שלנו מבשל עם תשוקה ואהבה כבר מעל 10 שנים</p>
          </div>
          <div className="why-card">
            <div className="why-icon">⚡</div>
            <h3>משלוח מהיר</h3>
            <p>מ-30 דקות ועד הדלת שלך — חם וטעים כאילו יצא הרגע מהמטבח</p>
          </div>
          <div className="why-card">
            <div className="why-icon">💰</div>
            <h3>מחירים הוגנים</h3>
            <p>אוכל איכותי לא חייב לעלות הון — אצלנו תמיד מחיר שכדאי</p>
          </div>
        </div>
      </section>

      {/* ══ DELIVERY SECTION ══ */}
      <section className="delivery-section">
        <div className="delivery-content">
          <div className="delivery-text">
            <span className="section-tag">🛵 משלוח מהיר</span>
            <h2 className="section-title">אנחנו מגיעים אליך!</h2>
            <p className="delivery-desc">
              המשלוחן שלנו יגיע בתוך 30 דקות — חם, טעים, ישירות לדלת שלך 🚀
            </p>
            <button className="btn-primary" onClick={() => navigate('/create-order')}>
              🛒 הזמן משלוח עכשיו
            </button>
          </div>
          <div className="delivery-img-wrap">
            <img src="/image/drive.jpg" alt="משלוחן יאמי" className="delivery-img" />
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="cta-banner">
        <div className="cta-content">
          <img src="/image/logo.png" alt="יאמי" className="cta-logo" />
          <div>
            <h2>רעבים? מה מחכים!</h2>
            <p>הזמינו עכשיו וקבלו חוויית אוכל שלא תשכחו</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/create-order')}>
            🛒 הזמן עכשיו
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="home-footer">
        <img src="/image/logo.png" alt="יאמי" className="footer-logo-img" />
        <p className="footer-tagline">אוכל עם לב ❤️</p>
        <p className="footer-copy">© 2025 יאמי • כל הזכויות שמורות</p>
      </footer>

    </div>
  );
}

export default Home;
