const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  submitQuotation,
  updateQuotation,
  withdrawQuotation,
} = require('../controllers/quotationController');

const router = express.Router();

router.use(protect);

router.post('/', authorize('vendor'), submitQuotation);
router.put('/:id', authorize('vendor'), updateQuotation);
router.delete('/:id', authorize('vendor'), withdrawQuotation);

module.exports = router;
