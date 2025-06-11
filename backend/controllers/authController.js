const bcrypt = require('bcryptjs'); // [cite: 27]
const jwt = require('jsonwebtoken'); // [cite: 27]
const { validationResult } = require('express-validator'); // [cite: 27]
const db = require('../config/database'); // [cite: 27]

// Generate JWT token
const generateToken = (userId) => { // [cite: 28]
    return jwt.sign( // [cite: 28]
        { userId }, // [cite: 28]
        process.env.JWT_SECRET || 'your-secret-key', // [cite: 28]
        { expiresIn: '24h' } // [cite: 28]
    );
};

// Register new user
const register = async (req, res) => { // [cite: 29]
    try {
        // Check for validation errors
        const errors = validationResult(req); // [cite: 29]
        if (!errors.isEmpty()) { // [cite: 30]
            return res.status(400).json({ // [cite: 30]
                success: false, // [cite: 30]
                message: 'Validation failed', // [cite: 30]
                errors: errors.array() // [cite: 30]
            });
        }

        const { name, email, password } = req.body; // [cite: 31]
        // Check if user already exists
        const [existingUsers] = await db.execute( // [cite: 32]
            'SELECT id FROM users WHERE email = ?', // [cite: 32]
            [email] // [cite: 32]
        );
        if (existingUsers.length > 0) { // [cite: 33]
            return res.status(400).json({ // [cite: 33]
                success: false, // [cite: 33]
                message: 'Email already registered' // [cite: 33]
            });
        }

        // Hash password
        const saltRounds = 10; // [cite: 34]
        const hashedPassword = await bcrypt.hash(password, saltRounds); // [cite: 35]

        // Insert new user
        const [result] = await db.execute( // [cite: 35]
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', // [cite: 35]
            [name, email, hashedPassword] // [cite: 35]
        );
        const token = generateToken(result.insertId); // [cite: 36]

        res.status(201).json({ // [cite: 36]
            success: true, // [cite: 36]
            message: 'User registered successfully', // [cite: 36]
            token, // [cite: 36]
            user: { // [cite: 36]
                id: result.insertId, // [cite: 36]
                name, // [cite: 36]
                email, // [cite: 37]
                is_admin: false // [cite: 37]
            }
        });
    } catch (error) { // [cite: 38]
        console.error('Registration error:', error); // [cite: 38]
        res.status(500).json({ // [cite: 39]
            success: false, // [cite: 39]
            message: 'Internal server error' // [cite: 39]
        });
    }
};

// Login user
const login = async (req, res) => { // [cite: 40]
    try {
        // Check for validation errors
        const errors = validationResult(req); // [cite: 40]
        if (!errors.isEmpty()) { // [cite: 41]
            return res.status(400).json({ // [cite: 41]
                success: false, // [cite: 41]
                message: 'Validation failed', // [cite: 41]
                errors: errors.array() // [cite: 41]
            });
        }

        const { email, password } = req.body; // [cite: 42]
        // Find user by email
        const [users] = await db.execute( // [cite: 43]
            'SELECT id, name, email, password, is_admin FROM users WHERE email = ?', // [cite: 43]
            [email] // [cite: 43]
        );
        if (users.length === 0) { // [cite: 44]
            return res.status(401).json({ // [cite: 44]
                success: false, // [cite: 44]
                message: 'Invalid email or password' // [cite: 44]
            });
        }

        const user = users[0]; // [cite: 45]
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password); // [cite: 46]
        if (!isPasswordValid) { // [cite: 47]
            return res.status(401).json({ // [cite: 47]
                success: false, // [cite: 47]
                message: 'Invalid email or password' // [cite: 47]
            });
        }

        const token = generateToken(user.id); // [cite: 48]
        res.json({ // [cite: 49]
            success: true, // [cite: 49]
            message: 'Login successful', // [cite: 49]
            token, // [cite: 49]
            user: { // [cite: 49]
                id: user.id, // [cite: 49]
                name: user.name, // [cite: 49]
                email: user.email, // [cite: 50]
                is_admin: user.is_admin // [cite: 50]
            }
        });
    } catch (error) { // [cite: 51]
        console.error('Login error:', error); // [cite: 51]
        res.status(500).json({ // [cite: 52]
            success: false, // [cite: 52]
            message: 'Internal server error' // [cite: 52]
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => { // [cite: 53]
    try {
        res.json({ // [cite: 53]
            success: true, // [cite: 53]
            user: req.user // [cite: 53]
        });
    } catch (error) { // [cite: 54]
        console.error('Get profile error:', error); // [cite: 54]
        res.status(500).json({ // [cite: 55]
            success: false, // [cite: 55]
            message: 'Internal server error' // [cite: 55]
        });
    }
};

module.exports = {
    register, // [cite: 56]
    login, // [cite: 57]
    getProfile // [cite: 57]
};