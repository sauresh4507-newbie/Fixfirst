const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createRepairRequest,
  getMyRepairRequests,
  getRepairRequest,
  closeRepairRequest,
  cancelRepairRequest,
  escalateToVendors,
} = require('../controllers/repairController');
const { getQuotations } = require('../controllers/quotationController');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/', upload.array('images', 5), createRepairRequest);
router.get('/my-requests', getMyRepairRequests);
router.get('/:id', getRepairRequest);
router.post('/:id/close', closeRepairRequest);
router.post('/:id/cancel', cancelRepairRequest);
router.post('/:id/escalate', escalateToVendors);
router.get('/:id/quotations', getQuotations);

module.exports = router;
