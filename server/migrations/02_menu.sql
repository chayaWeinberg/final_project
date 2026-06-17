CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_filename VARCHAR(255),
    order_count INT NOT NULL DEFAULT 0,
    is_hit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO menus (category, name, description, price, image_filename, order_count, is_hit) VALUES
('starters', 'ברוסקטה', 'לחם קלוי עם עגבניות טריות ובזיליקום', 32.00, 'bruschetta.jpg', 20, FALSE),
('starters', 'מרק עגבניות', 'מרק עגבניות קרמי עם שמנת וצ׳ילי', 38.00, 'tomato-soup.jpg', 25, TRUE),
('starters', 'כדורי מוצרלה', 'מוצרלה פרשה מטוגנת עם רוטב מרינרה', 44.00, 'mozzarella-balls.jpg', 18, FALSE),
('mains', 'פיצה מרגריטה', 'עגבניות, מוצרלה, ריחן', 58.00, 'pizza-margherita.jpg', 15, FALSE),
('mains', 'פיצה ארבעה גבינות', 'מוצרלה, גורגונזולה, פרמזן, רוקפור', 72.00, 'pizza-4cheese.jpg', 30, TRUE),
('mains', 'פסטה אלפרדו', 'ברוטב שמנת עשיר עם פרמזן', 64.00, 'pasta-alfredo.jpg', 10, FALSE),
('mains', 'ריזוטו פטריות', 'אורז איטלקי עם פטריות פורצ׳יני ופרמזן', 68.00, 'risotto.jpg', 22, TRUE),
('salads', 'סלט קיסר', 'חסה רומית, קרוטונים, פרמזן, רוטב קיסר', 46.00, 'caesar.jpg', 35, TRUE),
('salads', 'סלט יווני', 'עגבניות, מלפפון, זיתים, גבינת פטה', 42.00, 'greek-salad.jpg', 28, FALSE),
('salads', 'סלט קפרזה', 'מוצרלה פרשה, עגבניות, בזיליקום, שמן זית', 48.00, 'caprese.jpg', 15, FALSE),
('drinks', 'לימונדה טרייה', 'לימון סחוט, נענע, סוכר, מים מוגזים', 22.00, 'lemonade.jpg', 40, FALSE),
('drinks', 'שייק תות', 'תות טרי, יוגורט, דבש', 28.00, 'strawberry-shake.jpg', 18, FALSE),
('drinks', 'קפה קר', 'אספרסו כפול על קרח עם חלב', 24.00, 'iced-coffee.jpg', 50, TRUE),
('desserts', 'טירמיסו', 'קרם מסקרפונה, ביסקוויטי ספוג, קקאו', 38.00, 'tiramisu.jpg', 45, TRUE),
('desserts', 'פנה קוטה', 'קרם וניל עם רוטב פירות יער', 34.00, 'panna-cotta.jpg', 30, FALSE),
('desserts', 'פונדנט שוקולד', 'עוגת שוקולד חמה עם מרכז נוזלי וגלידה', 42.00, 'fondant.jpg', 38, TRUE);