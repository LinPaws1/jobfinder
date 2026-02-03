const express = require('express');
const interview = require('../controllers/interviewController');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);
router.get('/', interview.myInterviews);
router.get('/request/:jobId', requireRole('jobseeker'), interview.showRequest);
router.post('/request/:jobId', requireRole('jobseeker'), interview.request);
router.post('/:id/approve', requireRole('employer'), interview.approve);
router.post('/:id/decline', requireRole('employer'), interview.decline);
router.post('/:id/cancel', interview.cancel);

module.exports = router;
