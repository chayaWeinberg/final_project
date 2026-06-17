const menuService = require('../services/menuService');

// ========== GET FUNCTIONS ==========

async function getAllItems(req, res, next) {
    try {
        const items = await menuService.getAllItems();
        return res.json(items);
    } catch (err) {
        next(err);
    }
}

async function getItemById(req, res, next) {
    const { id } = req.params;
    try {
        const item = await menuService.getItemById(id);
        return res.json(item);
    } catch (err) {
        next(err);
    }
}
async function getItemsByCategory(req, res, next) {
    const { category } = req.params;
    try {
        const items = await menuService.getItemsByCategory(category);
        return res.json(items);
    } catch (err) {
        next(err);
    }
}
async function getHitItems(req, res, next) {
    try {
        const items = await menuService.getHitItems();
        return res.json(items);
    } catch (err) {
        next(err);
    }
}

// ========== POST FUNCTION ==========

async function addItem(req, res, next) {
    try {
        const newItem = await menuService.addItem(req.body);
        return res.status(201).json(newItem);
    } catch (err) {
        next(err);
    }
}

// ========== PUT FUNCTION ==========       
async function updateItem(req, res, next) {
    const { id } = req.params;
    try {
        const updatedItem = await menuService.updateItem(id, req.body);
        return res.json(updatedItem);
    } catch (err) {
        next(err);
    }
}
async function incrementOrderCount(req, res, next) {
    const { id } = req.params;
    try {
        await menuService.incrementOrderCount(id);
        return res.json({ message: 'Order count incremented' });
    } catch (err) { next(err); }
}


// ======DELETE FUNCTION ========
async function deleteItem(req, res, next) {
    const { id } = req.params;
    try {
        await menuService.deleteItem(id);
        return res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        next(err);
    }
}

// ========== SEARCH FUNCTION ==========
async function searchItems(req, res, next) {
    const { query } = req.query;
    try {
        const items = await menuService.searchItems(query);
        return res.json(items);
    } catch (err) {
        next(err);
    }
}

// ========== UPLOAD IMAGE (base64) ==========
async function uploadMenuImage(req, res, next) {
    try {
        const { imageData, filename } = req.body;

        if (!imageData || !filename) {
            return res.status(400).json({ message: 'imageData and filename are required' });
        }

        // Validate file extension
        const ext = filename.split('.').pop().toLowerCase();
        const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!allowed.includes(ext)) {
            return res.status(400).json({ message: 'File type not allowed' });
        }

        // Sanitize filename — letters, digits, dash, underscore, dot only
        const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

        // Decode base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Limit size to 5MB
        if (buffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'Image too large (max 5MB)' });
        }

        const path = require('path');
        const fs = require('fs');
        const uploadDir = path.join(__dirname, '..', '..', 'client', 'public', 'image');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, safeFilename);
        fs.writeFileSync(filePath, buffer);

        return res.json({ filename: safeFilename, message: 'Image uploaded successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = { searchItems, deleteItem, updateItem, getHitItems, getItemsByCategory, getItemById, getAllItems, addItem, incrementOrderCount, uploadMenuImage };