const express = require('express');
const router = express.Router();
const { signup, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { signupValidator, loginValidator } = require('../validators/authValidator');

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
