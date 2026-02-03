const express = require('express');
const auth = require('../controllers/authController');
const router = express.Router();

router.get('/login', auth.showLogin);
router.get('/register', auth.showRegister);
router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/logout', auth.logout);

module.exports = router;
