import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStats } from '../../../api/adminApi';
import './Dashboard.css';

const STATUS_COLORS = {
    pending:   '#f0b429',  /* זהב */
    confirmed: '#a0713a',  /* חום בינוני */
    preparing: '#c8870a',  /* כתום-חום */
    ready:     '#6b3f10',  /* חום כהה */
    delivered: '#b09070',  /* קרם כהה */
    cancelled: '#c0392b',  /* אדום עמוק */
};

const STATUS_LABELS = {
    pending:   'ממתינה',
    confirmed: 'אושרה',
    preparing: 'בהכנה',
    ready:     'מוכנה',
    delivered: 'נמסרה',
    cancelled: 'בוטלה',
};

const PIE_COLORS = [
    '#f0b429','#e8a020','#c8870a','#6b3f10','#a0713a',
    '#8b5520','#d4910a','#f5c842','#b07830','#7a5c38'
];

const CATEGORY_LABELS = {
    starters: 'מנות פתיחה',
    mains:    'עיקריות',
    salads:   'סלטים',
    drinks:   'שתייה',
    desserts: 'קינוחים',
};

/* ── Count-up ── */
function useCountUp(target, delay = 0, active = false) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!active) return;
        const t = setTimeout(() => {
            const steps = 40;
            const inc = target / steps;
            let cur = 0;
            const iv = setInterval(() => {
                cur += inc;
                if (cur >= target) { setValue(target); clearInterval(iv); }
                else setValue(Math.floor(cur));
            }, 1100 / steps);
            return () => clearInterval(iv);
        }, delay);
        return () => clearTimeout(t);
    }, [target, delay, active]);
    return value;
}

/* ── KPI card ── */
function KpiCard({ icon, label, rawValue, prefix = '', delay = 0, active }) {
    const counted = useCountUp(Number(rawValue) || 0, delay, active);
    const display = `${prefix}${counted.toLocaleString('he-IL')}`;
    return (
        <div className={`kpi-card${active ? ' kpi-card--visible' : ''}`}
             style={{ transitionDelay: `${delay}ms` }}>
            <img src={icon} alt={label} className="kpi-card__icon-img" />
            <div className="kpi-card__body">
                <span className="kpi-card__label">{label}</span>
                <span className="kpi-card__value">{display}</span>
            </div>
        </div>
    );
}

const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <strong>{payload[0].name}</strong>
            <span>{payload[0].value} הזמנות</span>
        </div>
    );
};

/* ── Animated Pie ── */
function AnimatedPie({ data, show }) {
    if (!show) return <div style={{ height: 280 }} />;
    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data} cx="50%" cy="50%"
                    innerRadius={65} outerRadius={105}
                    paddingAngle={3} dataKey="value"
                    isAnimationActive animationBegin={0}
                    animationDuration={900} animationEasing="ease-out"
                >
                    {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={v => (
                    <span style={{ fontSize: 13, color: '#3d2810' }}>{v}</span>
                )} />
            </PieChart>
        </ResponsiveContainer>
    );
}

/* ════════════════════════════
   DASHBOARD
════════════════════════════ */
function Dashboard() {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);
    const [ready, setReady]   = useState(false);

    useEffect(() => {
        getStats()
            .then(d => { setData(d); setTimeout(() => setReady(true), 80); })
            .catch(() => setError('שגיאה בטעינת הנתונים'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="dash-loading">
            <p>טוען נתונים...</p>
        </div>
    );
    if (error) return <div className="dash-error">{error}</div>;

    const { summary, topItems, ordersByStatus } = data;

    const statusChartData = ordersByStatus.map(({ status, count }) => ({
        name: STATUS_LABELS[status] || status,
        value: Number(count),
        color: STATUS_COLORS[status] || '#999',
    }));

    const topItemsChartData = topItems.map((item, i) => ({
        name: item.name,
        value: Number(item.order_count),
        color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    const top5 = topItems.slice(0, 5);

    return (
        <div className={`dashboard${ready ? ' dashboard--in' : ''}`}>
            <div className="dashboard__header">
                <img src="/image/dashbord.png" alt="דשבורד" className="dashboard__title-icon" />
                <h1 className="dashboard__title">סקירה כללית</h1>
            </div>

            <div className="kpi-grid">
                <KpiCard active={ready} delay={0}   icon="/image/orders.png"   label="סה״כ הזמנות"   rawValue={summary.total_orders} />
                <KpiCard active={ready} delay={120} icon="/image/order.png"    label="הזמנות פעילות" rawValue={summary.active_orders} />
                <KpiCard active={ready} delay={240} icon="/image/pay.png"      label="הכנסות כוללות" rawValue={summary.total_revenue} prefix="₪" />
                <KpiCard active={ready} delay={360} icon="/image/menu.png"     label="פריטים בתפריט" rawValue={summary.menu_items} />
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h2 className="chart-card__title">סטטוס הזמנות</h2>
                    {statusChartData.length === 0
                        ? <p className="chart-empty">אין הזמנות עדיין</p>
                        : <AnimatedPie data={statusChartData} show={ready} />
                    }
                </div>
                <div className="chart-card">
                    <h2 className="chart-card__title">להיטי התפריט</h2>
                    {topItemsChartData.every(d => d.value === 0)
                        ? <p className="chart-empty">עדיין אין נתוני הזמנות</p>
                        : <AnimatedPie data={topItemsChartData} show={ready} />
                    }
                </div>
            </div>

            <div className="top-items-card">
                <h2 className="chart-card__title">הפריטים הכי מוזמנים</h2>
                <table className="top-table">
                    <thead>
                        <tr><th>#</th><th>שם</th><th>קטגוריה</th><th>כמות הזמנות</th></tr>
                    </thead>
                    <tbody>
                        {top5.map((item, i) => (
                            <tr key={item.id} className="top-table__row"
                                style={{ animationDelay: `${200 + i * 80}ms` }}>
                                <td><span className={`rank rank--${i + 1}`}>{i + 1}</span></td>
                                <td className="top-table__name">{item.name}</td>
                                <td className="top-table__cat">{CATEGORY_LABELS[item.category] || item.category}</td>
                                <td>
                                    <div className="order-bar">
                                        <div className="order-bar__fill"
                                            style={{ width: `${Math.min(100, (item.order_count / (top5[0]?.order_count || 1)) * 100)}%` }} />
                                        <span className="order-bar__label">{item.order_count}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
