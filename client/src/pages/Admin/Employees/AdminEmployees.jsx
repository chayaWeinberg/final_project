import { useEffect, useState } from 'react';
import {
    getEmployees,
    createEmployee,
    deactivateEmployee,
    reactivateEmployee,
} from '../../../api/adminApi';
import './AdminEmployees.css';

const EMPTY_FORM = { name: '', email: '', password: '', phone: '' };

function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [showForm, setShowForm]   = useState(false);
    const [form, setForm]           = useState(EMPTY_FORM);
    const [formError, setFormError] = useState(null);
    const [saving, setSaving]       = useState(false);
    const [actingOn, setActingOn]   = useState(null);
    const [showPass, setShowPass]   = useState(false);

    useEffect(() => {
        getEmployees()
            .then(setEmployees)
            .catch(() => setError('שגיאה בטעינת רשימת העובדים'))
            .finally(() => setLoading(false));
    }, []);

    function openForm() {
        setForm(EMPTY_FORM);
        setFormError(null);
        setShowForm(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            setFormError('שם, אימייל וסיסמה הם שדות חובה');
            return;
        }
        setSaving(true);
        try {
            const emp = await createEmployee(form);
            setEmployees(prev => [
                { ...emp, active_orders: 0, delivered_orders: 0, total_orders: 0 },
                ...prev
            ]);
            setShowForm(false);
        } catch (err) {
            setFormError(err.message || 'שגיאה ביצירת העובד');
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate(id) {
        if (!window.confirm('להסיר את העובד? ניתן להפעיל מחדש בעתיד.')) return;
        setActingOn(id);
        try {
            await deactivateEmployee(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            alert(err.message || 'שגיאה בהסרת העובד');
        } finally {
            setActingOn(null);
        }
    }

    if (loading) return <div className="ae-loading">טוען עובדים...</div>;
    if (error)   return <div className="ae-error">{error}</div>;

    return (
        <div className="admin-employees">
            <div className="ae-header">
                <h1 className="ae-title">ניהול עובדים</h1>
                <button className="ae-add-btn" onClick={openForm}>+ הוסף עובד</button>
            </div>

            {employees.length === 0 ? (
                <div className="ae-empty">
                    <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🍳</div>
                    <p>אין עובדים רשומים עדיין</p>
                    <button className="ae-add-btn" onClick={openForm} style={{ marginTop: 12 }}>
                        הוסף עובד ראשון
                    </button>
                </div>
            ) : (
                <div className="ae-table-wrap">
                    <table className="ae-table">
                        <thead>
                            <tr>
                                <th>שם</th>
                                <th>אימייל</th>
                                <th>טלפון</th>
                                <th>הזמנות פעילות</th>
                                <th>נמסרו</th>
                                <th>סה"כ</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id} className="ae-row">
                                    <td className="ae-name">
                                        <span className="ae-avatar">👨‍🍳</span>
                                        {emp.name}
                                    </td>
                                    <td dir="ltr">{emp.email}</td>
                                    <td dir="ltr">{emp.phone || '—'}</td>
                                    <td>
                                        <span className={`ae-badge ${emp.active_orders > 0 ? 'ae-badge--active' : 'ae-badge--zero'}`}>
                                            {emp.active_orders}
                                        </span>
                                    </td>
                                    <td>{emp.delivered_orders}</td>
                                    <td>{emp.total_orders}</td>
                                    <td>
                                        <button
                                            className="ae-btn ae-btn--remove"
                                            disabled={actingOn === emp.id}
                                            onClick={() => handleDeactivate(emp.id)}
                                        >
                                            הסר
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add employee modal */}
            {showForm && (
                <div className="ae-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="ae-modal" onClick={e => e.stopPropagation()}>
                        <h2 className="ae-modal__title">רישום עובד חדש</h2>
                        {formError && <p className="ae-form-error">{formError}</p>}
                        <form className="ae-form" onSubmit={handleSubmit}>
                            <label className="ae-label">שם מלא *
                                <input
                                    className="ae-input"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="ישראל ישראלי"
                                />
                            </label>
                            <label className="ae-label">אימייל *
                                <input
                                    className="ae-input"
                                    type="email"
                                    dir="ltr"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="employee@yami.co.il"
                                />
                            </label>
                            <label className="ae-label">טלפון
                                <input
                                    className="ae-input"
                                    type="tel"
                                    dir="ltr"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="050-0000000"
                                />
                            </label>
                            <label className="ae-label">סיסמה * (לפחות 8 תווים)
                                <div className="ae-pass-wrap">
                                    <input
                                        className="ae-input"
                                        type={showPass ? 'text' : 'password'}
                                        dir="ltr"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="סיסמה חזקה"
                                    />
                                    <button
                                        type="button"
                                        className="ae-pass-toggle"
                                        onClick={() => setShowPass(p => !p)}
                                    >
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </label>
                            <div className="ae-form-actions">
                                <button
                                    type="button"
                                    className="ae-btn ae-btn--cancel"
                                    onClick={() => setShowForm(false)}
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    className="ae-btn ae-btn--save"
                                    disabled={saving}
                                >
                                    {saving ? 'שומר...' : 'צור עובד'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEmployees;
