const jwt = require('jsonwebtoken'); // [cite: 17]
const db = require('../config/database'); // [cite: 18]

// Verify JWT token and get user info
const authenticateToken = async (req, res, next) => { // [cite: 18]
    const authHeader = req.headers['authorization']; // [cite: 18]
    const token = authHeader && authHeader.split(' ')[1]; // [cite: 19]

    if (!token) { // [cite: 19]
        return res.status(401).json({ // [cite: 19]
            success: false, // [cite: 19]
            message: 'Access token required' // [cite: 19]
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key'); // [cite: 20]
        // Get user from database to ensure they still exist
        const [users] = await db.execute( // [cite: 21]
            'SELECT id, name, email, is_admin FROM users WHERE id = ?', // [cite: 21]
            [decoded.userId] // [cite: 21]
        );
        if (users.length === 0) { // [cite: 22]
            return res.status(401).json({ // [cite: 22]
                success: false, // [cite: 22]
                message: 'User not found' // [cite: 22]
            });
        }

        req.user = users[0]; // [cite: 23]
        next(); // [cite: 23]
    } catch (error) { // [cite: 24]
        return res.status(403).json({ // [cite: 24]
            success: false, // [cite: 24]
            message: 'Invalid or expired token' // [cite: 24]
        });
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => { // [cite: 25]
    if (!req.user.is_admin) { // [cite: 25]
        return res.status(403).json({ // [cite: 25]
            success: false, // [cite: 25]
            message: 'Admin access required' // [cite: 25]
        });
    }
    next(); // [cite: 26]
};

module.exports = {
    authenticateToken, // [cite: 26]
    requireAdmin // [cite: 26]
};