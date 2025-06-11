const express = require('express'); // [cite: 142]
const { body } = require('express-validator'); // [cite: 142]
const { register, login, getProfile } = require('../controllers/authController'); // [cite: 142]
const { authenticateToken } = require('../middleware/auth'); // [cite: 143]

const router = express.Router(); // [cite: 143]

// Validation rules
const registerValidation = [ // [cite: 144]
    body('name').notEmpty().withMessage('Name is required'), // [cite: 144]
    body('email').isEmail().withMessage('Valid email is required'), // [cite: 144]
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters') // [cite: 144]
];
const loginValidation = [ // [cite: 145]
    body('email').isEmail().withMessage('Valid email is required'), // [cite: 145]
    body('password').notEmpty().withMessage('Password is required') // [cite: 145]
];

// Routes
router.post('/register', registerValidation, register); // [cite: 146]
router.post('/login', loginValidation, login); // [cite: 146]
router.get('/profile', authenticateToken, getProfile); // [cite: 146]

module.exports = router; // [cite: 146]