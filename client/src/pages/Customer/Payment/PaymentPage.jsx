import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../../../api/orderApi';
import { playOrderSuccess } from '../../../utils/sounds';
import './PaymentPage.css';

/* ── Luhn algorithm — validates card number format ── */
function luhn(num) {
    const digits = num.replace(/\D/g, '').split('').reverse().map(Number);
    const sum = digits.reduce((acc, d, i) => {
        if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
        return acc + d;
    }, 0);
    return sum % 10 === 0;
}

function formatCardNumber(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
}

function detectNetwork(num) {
    const n = num.replace(/\D/g, '');
    if (/^4/.test(n))          return { name: 'Visa',       icon: '💳' };
    if (/^5[1-5]/.test(n))     return { name: 'Mastercard', icon: '💳' };
    if (/^3[47]/.test(n))      return { name: 'Amex',       icon: '💳' };
    if (/^(6011|65)/.test(n))  return { name: 'Discover',   icon: '💳' };
    return null;
}

const STEPS = ['עגלה', 'משלוח', 'תשלום', 'אישור'];

export default function PaymentPage() {
    const location = useLocation();
    const navigate  = useNavigate();

    // State passed from CreateOrder
    const { cart = [], deliveryAddress = '', phone = '', total = 0 } = location.state || {};

    // If arrived without cart data, go back
    useEffect(() => {
        if (!cart.length) navigate('/create-order');
    }, []);

    const [step, setStep] = useState(0); // 0=delivery review, 1=card, 2=processing, 3=success

    // Card fields
    const [cardNumber, setCardNumber]   = useState('');
    const [cardName, setCardName]       = useState('');
    const [expiry, setExpiry]           = useState('');
    const [cvv, setCvv]                 = useState('');
    const [errors, setErrors]           = useState({});
    const [flipped, setFlipped]         = useState(false);
    const [processing, setProcessing]   = useState(false);
    const [orderId, setOrderId]         = useState(null);
    const [installments, setInstallments] = useState('1');

    const network = detectNetwork(cardNumber);

    function validateCard() {
        const errs = {};
        const raw = cardNumber.replace(/\D/g, '');
        if (raw.length < 16)           errs.cardNumber = 'מספר כרטיס לא תקין';
        else if (!luhn(raw))           errs.cardNumber = 'מספר כרטיס לא תקין';
        if (!cardName.trim())          errs.cardName   = 'שם בעל הכרטיס חסר';
        const [mm, yy] = expiry.split('/');
        const now = new Date();
        const exp = new Date(2000 + Number(yy), Number(mm) - 1);
        if (!mm || !yy || exp < now)   errs.expiry     = 'תוקף לא תקין';
        if (cvv.length < 3)            errs.cvv        = 'CVV לא תקין';
        return errs;
    }

    async function handlePay(e) {
        e.preventDefault();
        const errs = validateCard();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setProcessing(true);
        setStep(2);

        try {
            // Simulate payment gateway delay (1.5s)
            await new Promise(r => setTimeout(r, 1500));

            // Create the actual order
            const orderData = {
                items: cart.map(item => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    special_instructions: item.special_instructions || ''
                })),
                delivery_address: deliveryAddress,
                phone,
            };

            const created = await createOrder(orderData);
            setOrderId(created.id || created.order_id);
            playOrderSuccess();
            setStep(3);
        } catch (err) {
            setStep(1);
            setErrors({ submit: err.message || 'שגיאה בעיבוד התשלום, נסה שוב' });
        } finally {
            setProcessing(false);
        }
    }

    // ── Step 3: Success screen ──────────────────────────────────────────────
    if (step === 3) {
        return (
            <div className="pay-page">
                <div className="pay-success">
                    <div className="pay-success__icon">✅</div>
                    <h1 className="pay-success__title">התשלום בוצע בהצלחה!</h1>
                    <p className="pay-success__sub">הזמנה #{orderId} התקבלה ונמצאת בטיפול</p>
                    <div className="pay-success__summary">
                        <div className="pay-success__row">
                            <span>סכום שחויב</span>
                            <strong>₪{Number(total).toFixed(2)}</strong>
                        </div>
                        <div className="pay-success__row">
                            <span>כרטיס</span>
                            <strong dir="ltr">**** {cardNumber.replace(/\D/g,'').slice(-4)}</strong>
                        </div>
                        <div className="pay-success__row">
                            <span>כתובת משלוח</span>
                            <strong>{deliveryAddress}</strong>
                        </div>
                    </div>
                    <button
                        className="pay-btn pay-btn--primary"
                        onClick={() => navigate('/my-orders')}
                    >
                        מעקב הזמנה
                    </button>
                    <button
                        className="pay-btn pay-btn--ghost"
                        onClick={() => navigate('/menu')}
                    >
                        חזור לתפריט
                    </button>
                </div>
            </div>
        );
    }

    // ── Step 2: Processing animation ───────────────────────────────────────
    if (step === 2) {
        return (
            <div className="pay-page">
                <div className="pay-processing">
                    <div className="pay-processing__spinner" />
                    <h2>מעבד תשלום...</h2>
                    <p>אנא אל תסגור את הדף</p>
                </div>
            </div>
        );
    }

    // ── Steps 0 & 1: Main layout ────────────────────────────────────────────
    return (
        <div className="pay-page">
            {/* Progress bar */}
            <div className="pay-progress">
                {STEPS.map((s, i) => (
                    <div key={s} className={`pay-progress__step ${i <= step + 1 ? 'pay-progress__step--done' : ''} ${i === step + 1 ? 'pay-progress__step--active' : ''}`}>
                        <div className="pay-progress__dot">{i < step + 1 ? '✓' : i + 1}</div>
                        <span>{s}</span>
                        {i < STEPS.length - 1 && <div className="pay-progress__line" />}
                    </div>
                ))}
            </div>

            <div className="pay-layout">
                {/* ── Left: Order summary ── */}
                <div className="pay-summary">
                    <h2 className="pay-summary__title">סיכום הזמנה</h2>
                    <div className="pay-summary__items">
                        {cart.map(item => (
                            <div key={item.id} className="pay-summary__item">
                                <div className="pay-summary__item-name">
                                    {item.name}
                                    <span className="pay-summary__qty">x{item.quantity}</span>
                                </div>
                                <span className="pay-summary__item-price">
                                    ₪{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="pay-summary__divider" />
                    <div className="pay-summary__row">
                        <span>משלוח</span><span>חינם 🎉</span>
                    </div>
                    <div className="pay-summary__total">
                        <span>סה"כ לתשלום</span>
                        <strong>₪{Number(total).toFixed(2)}</strong>
                    </div>
                    <div className="pay-summary__address">
                        <span>📍</span>
                        <span>{deliveryAddress}</span>
                    </div>
                    <div className="pay-summary__address">
                        <span>📞</span>
                        <span>{phone}</span>
                    </div>
                    <div className="pay-summary__secure">
                        🔒 תשלום מאובטח 256-bit SSL
                    </div>
                </div>

                {/* ── Right: Card form ── */}
                <div className="pay-form-wrap">
                    {/* Visual card */}
                    <div className={`pay-card-visual ${flipped ? 'pay-card-visual--flipped' : ''}`}>
                        <div className="pay-card-visual__front">
                            <div className="pay-card-visual__chip" />
                            <div className="pay-card-visual__number">
                                {cardNumber || '**** **** **** ****'}
                            </div>
                            <div className="pay-card-visual__bottom">
                                <div>
                                    <div className="pay-card-visual__label">שם בעל הכרטיס</div>
                                    <div className="pay-card-visual__value">
                                        {cardName || 'FULL NAME'}
                                    </div>
                                </div>
                                <div>
                                    <div className="pay-card-visual__label">תוקף</div>
                                    <div className="pay-card-visual__value">{expiry || 'MM/YY'}</div>
                                </div>
                                {network && (
                                    <div className="pay-card-visual__network">{network.name}</div>
                                )}
                            </div>
                        </div>
                        <div className="pay-card-visual__back">
                            <div className="pay-card-visual__stripe" />
                            <div className="pay-card-visual__cvv-wrap">
                                <span className="pay-card-visual__label">CVV</span>
                                <div className="pay-card-visual__cvv">{cvv || '***'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="pay-form" onSubmit={handlePay} noValidate>
                        <h2 className="pay-form__title">פרטי כרטיס אשראי</h2>

                        {errors.submit && (
                            <div className="pay-field-error pay-field-error--global">
                                ⚠️ {errors.submit}
                            </div>
                        )}

                        <label className="pay-label">
                            מספר כרטיס
                            <div className="pay-input-wrap">
                                <input
                                    className={`pay-input ${errors.cardNumber ? 'pay-input--error' : ''}`}
                                    value={cardNumber}
                                    onChange={e => {
                                        setCardNumber(formatCardNumber(e.target.value));
                                        setErrors(p => ({ ...p, cardNumber: '' }));
                                    }}
                                    placeholder="0000 0000 0000 0000"
                                    inputMode="numeric"
                                    dir="ltr"
                                    maxLength={19}
                                />
                                {network && <span className="pay-network">{network.name}</span>}
                            </div>
                            {errors.cardNumber && <span className="pay-field-error">{errors.cardNumber}</span>}
                        </label>

                        <label className="pay-label">
                            שם בעל הכרטיס
                            <input
                                className={`pay-input ${errors.cardName ? 'pay-input--error' : ''}`}
                                value={cardName}
                                onChange={e => {
                                    setCardName(e.target.value.toUpperCase());
                                    setErrors(p => ({ ...p, cardName: '' }));
                                }}
                                placeholder="FULL NAME"
                                dir="ltr"
                            />
                            {errors.cardName && <span className="pay-field-error">{errors.cardName}</span>}
                        </label>

                        <div className="pay-row">
                            <label className="pay-label">
                                תוקף
                                <input
                                    className={`pay-input ${errors.expiry ? 'pay-input--error' : ''}`}
                                    value={expiry}
                                    onChange={e => {
                                        setExpiry(formatExpiry(e.target.value));
                                        setErrors(p => ({ ...p, expiry: '' }));
                                    }}
                                    placeholder="MM/YY"
                                    inputMode="numeric"
                                    dir="ltr"
                                    maxLength={5}
                                />
                                {errors.expiry && <span className="pay-field-error">{errors.expiry}</span>}
                            </label>

                            <label className="pay-label">
                                CVV
                                <input
                                    className={`pay-input ${errors.cvv ? 'pay-input--error' : ''}`}
                                    value={cvv}
                                    onChange={e => {
                                        setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                                        setErrors(p => ({ ...p, cvv: '' }));
                                    }}
                                    onFocus={() => setFlipped(true)}
                                    onBlur={() => setFlipped(false)}
                                    placeholder="***"
                                    inputMode="numeric"
                                    dir="ltr"
                                    maxLength={4}
                                />
                                {errors.cvv && <span className="pay-field-error">{errors.cvv}</span>}
                            </label>
                        </div>

                        <label className="pay-label">
                            תשלומים
                            <select
                                className="pay-input"
                                value={installments}
                                onChange={e => setInstallments(e.target.value)}
                            >
                                <option value="1">תשלום אחד</option>
                                <option value="3">3 תשלומים</option>
                                <option value="6">6 תשלומים</option>
                                <option value="12">12 תשלומים</option>
                            </select>
                        </label>

                        <button
                            type="submit"
                            className="pay-btn pay-btn--primary pay-btn--large"
                            disabled={processing}
                        >
                            {processing
                                ? '⏳ מעבד...'
                                : `שלם ₪${Number(total).toFixed(2)}`
                            }
                        </button>

                        <button
                            type="button"
                            className="pay-btn pay-btn--ghost"
                            onClick={() => navigate('/create-order')}
                        >
                            ← חזור לעגלה
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
