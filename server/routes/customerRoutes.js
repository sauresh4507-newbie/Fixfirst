const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword } = require('../controllers/customerController');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
