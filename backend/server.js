const express = require('express');
const cors = require('cors');
const path = require('path'); // [cite: 12]
require('dotenv').config(); // [cite: 12]

// Import routes
const authRoutes = require('./routes/auth'); // [cite: 12]
const carRoutes = require('./routes/cars'); // [cite: 12]
const bookingRoutes = require('./routes/bookings'); // [cite: 12]

const app = express(); // [cite: 13]
const PORT = process.env.PORT || 5000; // [cite: 13]

// Middleware
app.use(cors()); // [cite: 13]
app.use(express.json()); // [cite: 13]
app.use(express.urlencoded({ extended: true })); // [cite: 13]

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // [cite: 14]

// Routes
app.use('/api/auth', authRoutes); // [cite: 14]
app.use('/api/cars', carRoutes); // [cite: 14]
app.use('/api/bookings', bookingRoutes); // [cite: 14]


// 404 handler
app.use((req, res, next) => {
    // Jika tidak ada rute sebelumnya yang cocok, kirim 404
    res.status(404).json({
        success: false,
        message: 'Route not found (alternative handler)'
    });
});

// Error handling middleware
app.use((err, req, res, next) => { // [cite: 15]
    console.error(err.stack); // [cite: 15]
    res.status(500).json({ // [cite: 15]
        success: false, // [cite: 15]
        message: 'Something went wrong!', // [cite: 15]
        error: process.env.NODE_ENV === 'development' ? err.message : {} // [cite: 15]
    });
});


app.listen(PORT, () => { // [cite: 17]
    console.log(`Server is running on port ${PORT}`); // [cite: 17]
});