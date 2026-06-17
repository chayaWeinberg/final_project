ALTER TABLE users
    MODIFY COLUMN role ENUM('customer', 'admin', 'employee') NOT NULL DEFAULT 'customer';

ALTER TABLE orders
    ADD COLUMN assigned_to INT NULL DEFAULT NULL,
    ADD CONSTRAINT fk_orders_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
