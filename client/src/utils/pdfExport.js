/**
 * pdfExport.js
 * Generates a printable order receipt using the browser's print API.
 * No external dependencies needed.
 */

const STATUS_LABELS = {
    pending:   'ממתינה',
    confirmed: 'אושרה',
    preparing: 'בהכנה',
    ready:     'מוכנה',
    delivered: 'נמסרה',
    cancelled: 'בוטלה',
};

/**
 * Download a single order as a PDF receipt
 * @param {Object} order - order object with items array
 */
export function downloadOrderReceipt(order) {
    const statusText = STATUS_LABELS[order.status] || order.status;
    const dateStr = new Date(order.created_at).toLocaleString('he-IL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const itemsRows = (order.items || []).map(item => `
        <tr>
            <td style="padding:6px 10px; border-bottom:1px solid #f0e4c8; text-align:right;">${item.name}</td>
            <td style="padding:6px 10px; border-bottom:1px solid #f0e4c8; text-align:center;">${item.quantity}</td>
            <td style="padding:6px 10px; border-bottom:1px solid #f0e4c8; text-align:left;" dir="ltr">₪${Number(item.price_at_order).toFixed(2)}</td>
            <td style="padding:6px 10px; border-bottom:1px solid #f0e4c8; text-align:left;" dir="ltr">₪${(item.price_at_order * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <title>קבלה - הזמנה #${order.id}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Heebo', Arial, sans-serif;
            background: #fff;
            color: #3d2810;
            padding: 40px;
            direction: rtl;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #f0b429;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .header h1 { font-size: 28px; color: #6b3f10; }
        .header p  { color: #8b5520; font-size: 14px; margin-top: 4px; }
        .order-id  { font-size: 22px; font-weight: 700; color: #f0b429; margin: 8px 0; }
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 24px;
            background: #fdf8f0;
            padding: 16px;
            border-radius: 10px;
            border: 1px solid #f0e4c8;
        }
        .meta-item label { font-size: 11px; color: #b09070; display: block; }
        .meta-item span  { font-size: 14px; font-weight: 600; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        thead tr { background: #f0b429; color: #fff; }
        thead th { padding: 8px 10px; font-size: 13px; }
        .total-row {
            text-align: left;
            font-size: 18px;
            font-weight: 700;
            color: #6b3f10;
            padding: 12px 0;
            border-top: 2px solid #f0b429;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #b09070;
            font-size: 12px;
            border-top: 1px solid #f0e4c8;
            padding-top: 16px;
        }
        @media print {
            body { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍽️ יאמי — מסעדה</h1>
        <p>קבלת הזמנה</p>
        <div class="order-id">הזמנה #${order.id}</div>
    </div>

    <div class="meta-grid">
        <div class="meta-item">
            <label>תאריך הזמנה</label>
            <span>${dateStr}</span>
        </div>
        <div class="meta-item">
            <label>סטטוס</label>
            <span>${statusText}</span>
        </div>
        <div class="meta-item">
            <label>כתובת משלוח</label>
            <span>${order.delivery_address}</span>
        </div>
        <div class="meta-item">
            <label>טלפון</label>
            <span>${order.phone}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="text-align:right;">פריט</th>
                <th style="text-align:center;">כמות</th>
                <th style="text-align:left;">מחיר ליחידה</th>
                <th style="text-align:left;">סה"כ</th>
            </tr>
        </thead>
        <tbody>
            ${itemsRows}
        </tbody>
    </table>

    <div class="total-row" dir="ltr">
        סה"כ לתשלום: ₪${Number(order.total_price).toFixed(2)}
    </div>

    <div class="footer">
        תודה שבחרתם ביאמי! 🙏<br/>
        נשמח לראותכם שוב
    </div>

    <script>
        window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
        // Fallback: direct download as HTML
        const a = document.createElement('a');
        a.href = url;
        a.download = `קבלה-הזמנה-${order.id}.html`;
        a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Download the full menu as a printable PDF/HTML
 * @param {Array} items - array of menu items
 */
export function downloadMenuPDF(items) {
    const CATEGORY_LABELS = {
        starters: 'מנות פתיחה',
        mains:    'עיקריות',
        salads:   'סלטים',
        drinks:   'שתייה',
        desserts: 'קינוחים',
    };

    // Group by category
    const grouped = items.reduce((acc, item) => {
        const cat = item.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const categorySections = Object.entries(grouped).map(([cat, catItems]) => `
        <div class="category-section">
            <h2 class="category-title">${CATEGORY_LABELS[cat] || cat}</h2>
            <div class="items-grid">
                ${catItems.map(item => `
                    <div class="item-card">
                        <div class="item-name">${item.name}${item.is_hit ? ' ⭐' : ''}</div>
                        <div class="item-desc">${item.description || ''}</div>
                        <div class="item-price" dir="ltr">₪${Number(item.price).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <title>תפריט יאמי</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Heebo', Arial, sans-serif;
            background: #fff;
            color: #3d2810;
            padding: 40px;
            direction: rtl;
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            border-bottom: 3px solid #f0b429;
            padding-bottom: 20px;
        }
        .header h1 { font-size: 36px; color: #6b3f10; }
        .header p  { color: #8b5520; font-size: 16px; margin-top: 6px; }
        .category-section { margin-bottom: 28px; }
        .category-title {
            font-size: 20px;
            color: #6b3f10;
            background: #fef3c7;
            padding: 8px 16px;
            border-radius: 8px;
            margin-bottom: 14px;
            border-right: 4px solid #f0b429;
        }
        .items-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .item-card {
            background: #fdf8f0;
            border: 1px solid #f0e4c8;
            border-radius: 8px;
            padding: 12px 14px;
        }
        .item-name  { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
        .item-desc  { font-size: 12px; color: #8b5520; margin-bottom: 6px; }
        .item-price { font-weight: 800; font-size: 16px; color: #f0b429; }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #b09070;
            font-size: 12px;
            border-top: 1px solid #f0e4c8;
            padding-top: 16px;
        }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍽️ יאמי — תפריט</h1>
        <p>⭐ = להיט המסעדה</p>
    </div>
    ${categorySections}
    <div class="footer">
        יאמי מסעדה — ניתן להזמין באתר או בטלפון
    </div>
    <script>
        window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'תפריט-יאמי.html';
        a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
