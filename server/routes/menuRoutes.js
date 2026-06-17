const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { getAllItems, getItemById, getItemsByCategory, getHitItems, addItem, updateItem, deleteItem, searchItems, incrementOrderCount } = require('../controllers/menuController');

router.get('/search', searchItems);
router.get('/', getAllItems);
router.get('/hits', getHitItems);
router.get('/category/:category', getItemsByCategory);
router.get('/:id', getItemById);

router.post('/', auth , adminOnly , addItem);
router.put('/:id', auth , adminOnly , updateItem);
router.delete('/:id', auth , adminOnly , deleteItem);
router.put('/:id/increment', auth, incrementOrderCount);

module.exports= router;