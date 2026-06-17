const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { getStats, createEmployee, getEmployees, deactivateEmployee, reactivateEmployee } = require('../controllers/adminController');
const { uploadMenuImage } = require('../controllers/menuController');
const path = require('path');
const fs = require('fs');

router.get('/stats',                         auth, adminOnly, getStats);
router.get('/employees',                     auth, adminOnly, getEmployees);
router.post('/employees',                    auth, adminOnly, createEmployee);
router.delete('/employees/:id',              auth, adminOnly, deactivateEmployee);
router.put('/employees/:id/reactivate',      auth, adminOnly, reactivateEmployee);

// Upload menu item image (base64)
router.post('/menu/upload-image',            auth, adminOnly, uploadMenuImage);

module.exports = router;
