const express = require('express');
const { protect } = require('../middleware/auth');
const { analyzeDeviceIssue, troubleshoot } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

router.post('/analyze-issue', analyzeDeviceIssue);
router.post('/troubleshoot', troubleshoot);

module.exports = router;
