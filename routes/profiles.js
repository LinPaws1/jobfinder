const express = require('express');
const profile = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);
router.get('/edit', profile.showEdit);
router.put('/edit', profile.update);

module.exports = router;
