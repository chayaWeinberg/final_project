import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMyStats } from '../../../api/employeeApi';
import { getUser } from '../../../utils/authStorage';

const STATUS_COLORS = {
    pending:   '#f0b429',
    confirmed: '#a0713a',
    preparing: '#c8870a',
    ready:     '#6b3f10',
    delivered: '#b09070',
    cancelled: '#c0392b',
};

const STATUS_LABELS = {
    pending:   'ממתינה',
    confirmed: 'אושרה',
    preparing: 'בהכנה',
    ready:     'מוכנה',
    delivered: 'נמסרה',
    cancelled: 'בוטלה',
};

const STATUS_GUIDE = [
    { status: 'pending',   label: 'ממתינה',  desc: 'הזמנה חדשה, טרם נלקחה' },
    { status: 'confirmed', label: 'אושרה',   desc: 'לקחת את ההזמנה, מתחיל לטפל' },
    { status: 'preparing', label: 'בהכנה',   desc: 'ההזמנה בהכנה' },
    { status: 'ready',     label: 'מוכנה',   desc: 'מוכנה למסירה ללקוח' },
    { status: 'delivered', label: 'נמסרה',   desc: 'הושלמה בהצלחה' },
    { status: 'cancelled', label: 'בוטלה',   desc: 'ההזמנה בוטלה' },
];

const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <strong>{payload[0].name}</strong>
            <span>{payload[0].value} הזמנות</span>
        </div>
    );
};

export default function EmployeeDashboard() {
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [ready, setReady]     = useState(false);
    const user                  = getUser();

    useEffect(() => {
        getMyStats()
            .then(d => { setStats(d); setTimeout(() => setReady(true), 80); })
            .catch(() => setError('שגיאה בטעינת הנתונים'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="ep-loading">טוען...</div>;
    if (error)   return <div className="ep-error">{error}</div>;

    const statusChartData = (stats.ordersByStatus || []).map(({ status, count }) => ({
        name:  STATUS_LABELS[status] || status,
        value: Number(count),
        color: STATUS_COLORS[status] || '#999',
    })).filter(d => d.value > 0);
    return (
        <div className={`ep-page ep-dashboard${ready ? ' ep-dashboard--in' : ''}`}>
            <h1 className="ep-title">
                שלום, {user?.name || 'עובד'} 👋
            </h1>

            {/* KPI strip */}
            <div className="ep-kpi-row">
                <div className="ep-kpi">
                    <span className="ep-kpi__label">הזמנות פעילות שלי</span>
                    <span className="ep-kpi__value">{stats.active_count}</span>
                </div>
                <div className="ep-kpi">
                    <span className="ep-kpi__label">טופלו היום</span>
                    <span className="ep-kpi__value">{stats.today_handled}</span>
                </div>
                <div className="ep-kpi">
                    <span className="ep-kpi__label">סה"כ שטיפלתי</span>
                    <span className="ep-kpi__value">{stats.total_handled}</span>
                </div>
            </div>

            {/* גרף עוגה — סטטוס הזמנות */}
            <div className="ep-dashboard-grid">
                <div className="chart-card">
                    <h2 className="chart-card__title">סטטוס הזמנות</h2>
                    {statusChartData.length === 0 ? (
                        <p className="chart-empty">אין הזמנות עדיין</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%" cy="50%"
                                    innerRadius={65} outerRadius={105}
                                    paddingAngle={3} dataKey="value"
                                    isAnimationActive animationBegin={0}
                                    animationDuration={900} animationEasing="ease-out"
                                >
                                    {statusChartData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                                <Legend formatter={v => (
                                    <span style={{ fontSize: 13, color: '#3d2810' }}>{v}</span>
                                )} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="ep-status-guide">
                    <h2 className="ep-status-guide__title">מדריך סטטוסים</h2>
                    <div className="ep-status-guide__list">
                        {STATUS_GUIDE.map(({ status, label, desc }) => (
                            <div key={status} className="ep-status-guide__row">
                                <span className={`status-badge status-badge--${status}`}>
                                    {label}
                                </span>
                                <span className="ep-status-guide__desc">— {desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
