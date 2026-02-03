const express = require('express');
const job = require('../controllers/jobController');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, requireRole('jobseeker'), job.list);
router.get('/my', requireAuth, requireRole('employer'), job.myJobs);
router.get('/new', requireAuth, requireRole('employer'), job.showCreate);
router.get('/:id/edit', requireAuth, requireRole('employer'), job.showEdit);
router.get('/:id', requireAuth, job.showOne);
router.post('/', requireAuth, requireRole('employer'), job.create);
router.put('/:id', requireAuth, requireRole('employer'), job.update);
router.delete('/:id', requireAuth, requireRole('employer'), job.delete);

module.exports = router;
