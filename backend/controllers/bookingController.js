const { validationResult } = require('express-validator'); // [cite: 100]
const db = require('../config/database'); // [cite: 100]

// Create new booking
const createBooking = async (req, res) => { // [cite: 101]
    const connection = await db.getConnection(); // [cite: 101]
    try {
        await connection.beginTransaction(); // [cite: 101]
        // Use connection for queries
        // Check for validation errors
        const errors = validationResult(req); // [cite: 101]
        if (!errors.isEmpty()) { // [cite: 102]
            return res.status(400).json({ // [cite: 102]
                success: false, // [cite: 102]
                message: 'Validation failed', // [cite: 102]
                errors: errors.array() // [cite: 102]
            });
        }

        const { car_id, start_date, end_date, payment_method } = req.body; // [cite: 103]
        const user_id = req.user.id; // [cite: 104]

        // Check if car exists and is available
        const [cars] = await connection.execute('SELECT * FROM cars WHERE id = ? AND available = TRUE FOR UPDATE', [car_id]);
        if (cars.length === 0) { // [cite: 105]
            return res.status(400).json({ // [cite: 105]
                success: false, // [cite: 105]
                message: 'Car not found or not available' // [cite: 105]
            });
        }

        const car = cars[0]; // [cite: 106]

        // Check for date conflicts
        const [conflictingBookings] = await connection.execute( // [cite: 107]
            `SELECT id FROM bookings
             WHERE car_id = ?
             AND status IN ('pending', 'confirmed')
             AND (
                 (start_date <= ? AND end_date >= ?) OR
                 (start_date <= ? AND end_date >= ?) OR
                 (start_date >= ? AND end_date <= ?)
             )`, // [cite: 108]
            [car_id, start_date, start_date, end_date, end_date, start_date, end_date] // [cite: 108]
        );

        if (conflictingBookings.length > 0) { // [cite: 109]
            return res.status(400).json({ // [cite: 109]
                success: false, // [cite: 109]
                message: 'Car is not available for selected dates' // [cite: 109]
            });
        }

        // Calculate total amount - PERUBAHAN DI SINI
        const sDate = new Date(start_date); // [cite: 110]
        const eDate = new Date(end_date); // [cite: 111]

        // Normalisasi tanggal ke UTC tengah malam untuk menghindari masalah zona waktu/DST saat menghitung selisih hari
        const utcStartDate = Date.UTC(sDate.getUTCFullYear(), sDate.getUTCMonth(), sDate.getUTCDate());
        const utcEndDate = Date.UTC(eDate.getUTCFullYear(), eDate.getUTCMonth(), eDate.getUTCDate());

        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const differenceInMilliseconds = utcEndDate - utcStartDate;
        // Math.round digunakan untuk keamanan, meskipun dengan UTC midnight seharusnya hasilnya integer.
        const differenceInDays = Math.round(differenceInMilliseconds / millisecondsPerDay);

        // Jumlah hari sewa adalah selisih hari + 1
        const rentalDays = differenceInDays + 1;

        if (rentalDays < 1) {
            // Ini seharusnya ditangani oleh validasi di rute (end_date >= start_date)
            // Jika terjadi, berarti ada logika yang salah atau input tidak valid lolos validasi.
            return res.status(400).json({
                success: false,
                message: 'End date must be on or after start date, resulting in at least 1 rental day.'
            });
        }

        const total_amount = rentalDays * car.price; // [cite: 112] // Menggunakan rentalDays yang baru

        // Create booking
        const [result] = await connection.execute( // [cite: 113]
            `INSERT INTO bookings (user_id, car_id, start_date, end_date, total_amount, payment_method, status)
             VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`, // [cite: 113] // Status default 'confirmed' dari kode asli
            [user_id, car_id, start_date, end_date, total_amount, payment_method] // [cite: 113]
        );

        // Get created booking with car and user details
        const [newBooking] = await connection.execute( // [cite: 114]
            `SELECT b.*, c.model, c.year, u.name as user_name
             FROM bookings b
             JOIN cars c ON b.car_id = c.id
             JOIN users u ON b.user_id = u.id
             WHERE b.id = ?`, // [cite: 115]
            [result.insertId] // [cite: 115]
        );

        await connection.commit(); // [cite: 116]
        res.status(201).json({ // [cite: 116]
            success: true, // [cite: 116]
            message: 'Booking created successfully', // [cite: 116]
            data: newBooking[0] // [cite: 116]
        });
    } catch (error) { // [cite: 117]
        await connection.rollback(); // [cite: 117]
        console.error('Create booking error:', error); // [cite: 117]
        res.status(500).json({ // [cite: 118]
            success: false, // [cite: 118]
            message: 'Failed to create booking' // [cite: 118]
        });
    }
    finally {
        connection.release(); // [cite: 118]
    }
};

// Get user bookings
const getUserBookings = async (req, res) => { // [cite: 119]
    try {
        const user_id = req.user.id; // [cite: 119]
        const [bookings] = await db.execute( // [cite: 120]
            `SELECT b.*, c.model, c.year, c.image
             FROM bookings b
             JOIN cars c ON b.car_id = c.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`, // [cite: 120]
            [user_id] // [cite: 121]
        );
        res.json({ // [cite: 122]
            success: true, // [cite: 122]
            data: bookings // [cite: 122]
        });
    } catch (error) { // [cite: 123]
        console.error('Get user bookings error:', error); // [cite: 123]
        res.status(500).json({ // [cite: 124]
            success: false, // [cite: 124]
            message: 'Failed to fetch bookings' // [cite: 124]
        });
    }
};

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => { // [cite: 125]
    try {
        const [bookings] = await db.execute( // [cite: 125]
            `SELECT b.*, c.model, c.year, u.name as user_name, u.email as user_email
             FROM bookings b
             JOIN cars c ON b.car_id = c.id
             JOIN users u ON b.user_id = u.id
             ORDER BY b.created_at DESC` // [cite: 126]
        );
        res.json({ // [cite: 127]
            success: true, // [cite: 127]
            data: bookings // [cite: 127]
        });
    } catch (error) { // [cite: 128]
        console.error('Get all bookings error:', error); // [cite: 128]
        res.status(500).json({ // [cite: 129]
            success: false, // [cite: 129]
            message: 'Failed to fetch bookings' // [cite: 129]
        });
    }
};

// Update booking status (Admin only)
const updateBookingStatus = async (req, res) => { // [cite: 130]
    try {
        const { id } = req.params; // [cite: 130]
        const { status } = req.body; // [cite: 131]

        // Validasi status sudah ada di routes/bookings.js,
        // namun tetap baik untuk ada pengecekan di controller sebagai lapisan pertahanan kedua.
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']; // [cite: 131]
        if (!validStatuses.includes(status)) { // [cite: 132]
            return res.status(400).json({ // [cite: 132]
                success: false, // [cite: 132]
                message: 'Invalid status' // [cite: 132]
            });
        }

        // Check if booking exists
        const [existingBooking] = await db.execute( // [cite: 133]
            'SELECT * FROM bookings WHERE id = ?', // [cite: 133]
            [id] // [cite: 133]
        );
        if (existingBooking.length === 0) { // [cite: 134]
            return res.status(404).json({ // [cite: 134]
                success: false, // [cite: 134]
                message: 'Booking not found' // [cite: 134]
            });
        }

        // Update booking status
        await db.execute( // [cite: 135]
            'UPDATE bookings SET status = ? WHERE id = ?', // [cite: 135]
            [status, id] // [cite: 135]
        );
        // Get updated booking
        const [updatedBooking] = await db.execute( // [cite: 136]
            `SELECT b.*, c.model, c.year, u.name as user_name
             FROM bookings b
             JOIN cars c ON b.car_id = c.id
             JOIN users u ON b.user_id = u.id
             WHERE b.id = ?`, // [cite: 137]
            [id] // [cite: 137]
        );
        res.json({ // [cite: 138]
            success: true, // [cite: 138]
            message: 'Booking status updated successfully', // [cite: 138]
            data: updatedBooking[0] // [cite: 138]
        });
    } catch (error) { // [cite: 139]
        console.error('Update booking status error:', error); // [cite: 139]
        res.status(500).json({ // [cite: 140]
            success: false, // [cite: 140]
            message: 'Failed to update booking status' // [cite: 140]
        });
    }
};

const getActiveBookingsSummary = async (req, res) => {
    try {
        // Langsung query ke VIEW seolah-olah itu adalah tabel
        const [summary] = await db.execute('SELECT * FROM activebookingssummary ORDER BY start_date ASC');
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Get active bookings summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active bookings summary'
        });
    }
};

const getCustomerHistory = async (req, res) => {
    try {
        const { userId } = req.params; // Ambil userId dari parameter URL
        const [history] = await db.execute('SELECT * FROM customerbookinghistory WHERE user_id = ? ORDER BY booking_made_on DESC', [userId]);

        if (history.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No booking history found for this customer or customer does not exist.'
            });
        }
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Get customer history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer booking history'
        });
    }
};

module.exports = {
    createBooking, // [cite: 141]
    getUserBookings, // [cite: 142]
    getAllBookings, // [cite: 142]
    updateBookingStatus, // [cite: 142]
    getActiveBookingsSummary,
    getCustomerHistory
};