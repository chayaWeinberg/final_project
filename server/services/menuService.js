const db = require('../config/db');

// ========== VALIDATIONS ==========

function validateItemInput(item) {
    if (!item || typeof item !== 'object') {
        throw new Error('Invalid item object');
    }

    const { name, description, price, category } = item;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Name is required');
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
        throw new Error('Description is required');
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        throw new Error('Price must be a positive number');
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
        throw new Error('Category is required');
    }

    return true;
}

function validateId(id) {
    if (!id || isNaN(id) || parseInt(id) <= 0) {
        throw new Error('Invalid item ID');
    }
    return true;
}

async function itemExists(id) {
    const [rows] = await db.query(
        'SELECT id FROM menus WHERE id = ?',
        [id]
    );

    if (rows.length === 0) {
        throw new Error('Item not found');
    }
    return true;
}

// ========== GET FUNCTIONS ==========

async function getAllItems() {
    try {
        const [rows] = await db.query(
            'SELECT id, name, description, price, category, is_hit, image_filename FROM menus'
        );
        return rows;
    } catch (err) {
        throw new Error('Failed to fetch items: ' + err.message);
    }
}

async function getItemById(id) {
    validateId(id);

    try {
        const [rows] = await db.query(
            'SELECT id, name, description, price, category, is_hit, image_filename FROM menus WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            const err = new Error('Item not found');
            err.status = 404;
            throw err;
        }

        return rows[0];
    } catch (err) {
        if (err.status === 404) throw err;
        throw new Error('Failed to fetch item: ' + err.message);
    }
}

async function getItemsByCategory(category) {
    if (!category || typeof category !== 'string') {
        throw new Error('Category must be a valid string');
    }

    try {
        const [rows] = await db.query(
            'SELECT id, name, description, price, category, is_hit, image_filename FROM menus WHERE category = ?',
            [category.trim()]
        );
        return rows;
    } catch (err) {
        throw new Error('Failed to fetch items by category: ' + err.message);
    }
}

async function getHitItems() {
    try {
        const [rows] = await db.query(
            'SELECT id, name, description, price, category, is_hit, image_filename FROM menus WHERE is_hit = 1'
        );
        return rows;
    } catch (err) {
        throw new Error('Failed to fetch hit items: ' + err.message);
    }
}

// ========== CREATE FUNCTION ==========

async function addItem(item) {
    validateItemInput(item);

    const { name, description, price, category, is_hit = false, image_filename = null } = item;

    try {
        const [result] = await db.query(
            'INSERT INTO menus (name, description, price, category, is_hit, image_filename) VALUES (?, ?, ?, ?, ?, ?)',
            [name.trim(), description.trim(), parseFloat(price), category.trim(), is_hit ? 1 : 0, image_filename]
        );

        return {
            id: result.insertId,
            name,
            description,
            price,
            category,
            is_hit,
            image_filename
        };
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new Error('Item with this name already exists');
        }
        throw new Error('Failed to add item: ' + err.message);
    }
}

// ========== UPDATE FUNCTION ==========

async function updateItem(id, item) {
    validateId(id);
    validateItemInput(item);
    await itemExists(id);

    const { name, description, price, category, is_hit, image_filename } = item;

    try {
        await db.query(
            'UPDATE menus SET name = ?, description = ?, price = ?, category = ?, is_hit = ?, image_filename = ? WHERE id = ?',
            [name.trim(), description.trim(), parseFloat(price), category.trim(), is_hit ? 1 : 0, image_filename, id]
        );

        return { id, name, description, price, category, is_hit, image_filename };
    } catch (err) {
        throw new Error('Failed to update item: ' + err.message);
    }
}
async function incrementOrderCount(id) {
    validateId(id);
    await itemExists(id);

    try {
        const [result] = await db.query(
            'UPDATE menus SET order_count = order_count + 1 WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Failed to increment order count');
        }

        return { id, message: 'Order count incremented' };
    } catch (err) {
        throw new Error('Failed to increment order count: ' + err.message);
    }
}




    // ========== DELETE FUNCTION ==========

    async function deleteItem(id) {
        validateId(id);
        await itemExists(id);

        try {
            await db.query('DELETE FROM menus WHERE id = ?', [id]);
            return { message: 'Item deleted successfully' };
        } catch (err) {
            throw new Error('Failed to delete item: ' + err.message);
        }
    }

    // ========== SEARCH FUNCTION ==========

    async function searchItems(query) {
        if (!query || typeof query !== 'string') {
            throw new Error('Search query must be a valid string');
        }

        const searchTerm = `%${query.trim()}%`;

        try {
            const [rows] = await db.query(
                'SELECT id, name, description, price, category, is_hit, image_filename FROM menus WHERE name LIKE ? OR description LIKE ?',
                [searchTerm, searchTerm]
            );
            return rows;
        } catch (err) {
            throw new Error('Failed to search items: ' + err.message);
        }
    }

    module.exports = {
    getAllItems,
    getItemById,
    getItemsByCategory,
    getHitItems,
    addItem,
    updateItem,
    deleteItem,
    searchItems,
    incrementOrderCount
};