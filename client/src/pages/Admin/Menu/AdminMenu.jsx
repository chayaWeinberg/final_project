import { useEffect, useState } from 'react';
import { getAllItems, addItem, updateItem, deleteItem, uploadMenuImage } from '../../../api/menuApi';
import './AdminMenu.css';

const CATEGORIES = ['starters', 'mains', 'salads', 'drinks', 'desserts'];
const CATEGORY_LABELS = {
    starters: 'מנות פתיחה',
    mains:    'עיקריות',
    salads:   'סלטים',
    drinks:   'שתייה',
    desserts: 'קינוחים',
};

const EMPTY_FORM = {
    name: '', description: '', price: '', category: 'mains',
    is_hit: false, image_filename: ''
};

function AdminMenu() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        getAllItems()
            .then(setItems)
            .catch(() => setError('שגיאה בטעינת התפריט'))
            .finally(() => setLoading(false));
    }, []);

    function openAdd() {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setFormError(null);
        setImageFile(null);
        setImagePreview(null);
        setShowForm(true);
    }

    function openEdit(item) {
        setForm({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            is_hit: !!item.is_hit,
            image_filename: item.image_filename || ''
        });
        setEditingId(item.id);
        setFormError(null);
        setImageFile(null);
        setImagePreview(item.image_filename ? `/image/${item.image_filename}` : null);
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditingId(null);
        setFormError(null);
        setImageFile(null);
        setImagePreview(null);
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setForm(f => ({ ...f, image_filename: file.name }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.description || !form.price || !form.category) {
            setFormError('יש למלא את כל השדות החובה');
            return;
        }
        setSaving(true);
        try {
            let finalForm = { ...form };

            // Upload image first if a new file was selected
            if (imageFile) {
                const uploaded = await uploadMenuImage(imageFile);
                finalForm.image_filename = uploaded.filename;
            }

            if (editingId) {
                const updated = await updateItem(editingId, finalForm);
                setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...updated } : i));
            } else {
                const created = await addItem(finalForm);
                setItems(prev => [...prev, created]);
            }
            closeForm();
        } catch (err) {
            setFormError(err.message || 'שגיאה בשמירה');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        try {
            await deleteItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
            setDeleteConfirm(null);
        } catch {
            alert('שגיאה במחיקה');
        }
    }

    async function toggleHit(item) {
        try {
            const updated = await updateItem(item.id, { ...item, is_hit: !item.is_hit });
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_hit: !i.is_hit } : i));
        } catch {
            alert('שגיאה בעדכון');
        }
    }

    const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

    if (loading) return <div className="am-loading">טוען תפריט...</div>;
    if (error)   return <div className="am-error">{error}</div>;

    return (
        <div className="admin-menu">
            <div className="admin-menu__header">
                <h1 className="admin-menu__title">ניהול תפריט</h1>
                <button className="am-add-btn" onClick={openAdd}>+ הוסף פריט</button>
            </div>

            {/* Category filter */}
            <div className="am-filters">
                <button
                    className={`am-filter${filter === 'all' ? ' am-filter--active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    הכל <span className="am-filter__count">{items.length}</span>
                </button>
                {CATEGORIES.map(c => (
                    <button
                        key={c}
                        className={`am-filter${filter === c ? ' am-filter--active' : ''}`}
                        onClick={() => setFilter(c)}
                    >
                        {CATEGORY_LABELS[c]}
                        <span className="am-filter__count">
                            {items.filter(i => i.category === c).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Items table */}
            <div className="am-table-wrap">
                <table className="am-table">
                    <thead>
                        <tr>
                            <th>שם</th>
                            <th>קטגוריה</th>
                            <th>מחיר</th>
                            <th>להיט</th>
                            <th>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(item => (
                            <tr key={item.id} className="am-row">
                                <td>
                                    <div className="am-item-name">{item.name}</div>
                                    <div className="am-item-desc">{item.description}</div>
                                </td>
                                <td>
                                    <span className="am-cat-badge">
                                        {CATEGORY_LABELS[item.category] || item.category}
                                    </span>
                                </td>
                                <td className="am-price">₪{Number(item.price).toFixed(2)}</td>
                                <td>
                                    <button
                                        className={`am-hit-toggle${item.is_hit ? ' am-hit-toggle--on' : ''}`}
                                        onClick={() => toggleHit(item)}
                                        title={item.is_hit ? 'הסר מלהיטים' : 'סמן כלהיט'}
                                    >
                                        {item.is_hit ? 'להיט' : '—'}
                                    </button>
                                </td>
                                <td>
                                    <div className="am-actions">
                                        <button className="am-btn am-btn--edit" onClick={() => openEdit(item)}>עריכה</button>
                                        <button className="am-btn am-btn--delete" onClick={() => setDeleteConfirm(item.id)}>מחיקה</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Form modal */}
            {showForm && (
                <div className="am-modal-overlay" onClick={closeForm}>
                    <div className="am-modal" onClick={e => e.stopPropagation()}>
                        <h2 className="am-modal__title">
                            {editingId ? 'עריכת פריט' : 'הוספת פריט חדש'}
                        </h2>
                        {formError && <p className="am-form-error">{formError}</p>}
                        <form className="am-form" onSubmit={handleSubmit}>
                            <label className="am-label">שם הפריט *
                                <input
                                    className="am-input"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="שם הפריט"
                                />
                            </label>
                            <label className="am-label">תיאור *
                                <textarea
                                    className="am-input am-textarea"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="תיאור קצר"
                                    rows={3}
                                />
                            </label>
                            <div className="am-form-row">
                                <label className="am-label">מחיר (₪) *
                                    <input
                                        className="am-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                </label>
                                <label className="am-label">קטגוריה *
                                    <select
                                        className="am-input"
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label className="am-label">תמונה
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="תצוגה מקדימה"
                                        className="am-image-preview"
                                    />
                                )}
                                <input
                                    className="am-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageChange}
                                />
                                {form.image_filename && !imageFile && (
                                    <span className="am-current-image">קובץ נוכחי: {form.image_filename}</span>
                                )}
                            </label>
                            <label className="am-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.is_hit}
                                    onChange={e => setForm(f => ({ ...f, is_hit: e.target.checked }))}
                                />
                                סמן כ"להיט"
                            </label>
                            <div className="am-form-actions">
                                <button type="button" className="am-btn am-btn--cancel" onClick={closeForm}>ביטול</button>
                                <button type="submit" className="am-btn am-btn--save" disabled={saving}>
                                    {saving ? 'שומר...' : 'שמור'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="am-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="am-modal am-modal--confirm" onClick={e => e.stopPropagation()}>
                        <h2 className="am-modal__title">מחיקת פריט</h2>
                        <p>האם למחוק את הפריט? פעולה זו אינה ניתנת לביטול.</p>
                        <div className="am-form-actions">
                            <button className="am-btn am-btn--cancel" onClick={() => setDeleteConfirm(null)}>ביטול</button>
                            <button className="am-btn am-btn--delete" onClick={() => handleDelete(deleteConfirm)}>מחק</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMenu;
