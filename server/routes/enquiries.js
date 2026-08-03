const express = require('express');
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const {
  createEnquiry,
  getEnquiries,
  updateEnquiry,
  updateEnquiryStatus,
  sendEnquiryEmail,
  deleteEnquiry
} = require('../controllers/enquiryController');

const router = express.Router();
router.use(auth, ownerOnly);
router.post('/', createEnquiry);
router.get('/', getEnquiries);
router.put('/:id', updateEnquiry);
router.patch('/:id/status', updateEnquiryStatus);
router.post('/:id/send-email', sendEnquiryEmail);
router.delete('/:id', deleteEnquiry);

module.exports = router;
