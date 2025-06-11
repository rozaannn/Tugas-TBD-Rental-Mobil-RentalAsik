const express = require('express'); // [cite: 154]
const { body, param } = require('express-validator'); // Import 'param' untuk validasi parameter URL
const {
    createBooking,
    getUserBookings,
    getAllBookings,
    updateBookingStatus,
    getActiveBookingsSummary,
    getCustomerHistory,
    createBookingByType
} = require('../controllers/bookingController'); // [cite: 155]
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // [cite: 156]

const router = express.Router(); // [cite: 156]

// Aturan validasi untuk pembuatan booking
const bookingValidation = [ // [cite: 157]
    body('car_id').isInt({ min: 1 }).withMessage('Valid car ID is required'), // [cite: 157]
    body('start_date').isDate().withMessage('Valid start date is required'), // [cite: 157]
    body('end_date').isDate().withMessage('Valid end date is required') // [cite: 157]
        .custom((value, { req }) => {
            // Pastikan tanggal selesai tidak sebelum tanggal mulai
            if (new Date(value) < new Date(req.body.start_date)) {
                throw new Error('End date cannot be before start date');
            }
            return true;
        }),
    body('payment_method').isIn(['bank', 'ewallet', 'cash']).withMessage('Valid payment method is required') // [cite: 157]
];

// Aturan validasi untuk pembaruan status booking
const updateStatusValidation = [
    // Validasi 'id' yang ada di URL (contoh: /api/bookings/123/status)
    param('id').isInt({ min: 1 }).withMessage('Valid booking ID is required in the URL path'),
    // Validasi field 'status' yang ada di body permintaan
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
        .withMessage('Invalid status value. Must be one of: pending, confirmed, completed, cancelled')
];

const bookingByTypeValidation = [
    body('model').notEmpty().withMessage('Model mobil wajib diisi'),
    body('year').isInt().withMessage('Tahun mobil wajib diisi'),
    body('start_date').isDate().withMessage('Format tanggal mulai salah'),
    body('end_date').isDate().withMessage('Format tanggal selesai salah')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.start_date)) {
                throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai');
            }
            return true;
        }),
    body('payment_method').isIn(['bank', 'ewallet', 'cash']).withMessage('Metode pembayaran tidak valid')
];

// Rute-rute
router.get('/history/customer/:userId', authenticateToken, requireAdmin, getCustomerHistory);
router.post('/', authenticateToken, bookingValidation, createBooking); // [cite: 158]

// Mendapatkan booking milik pengguna yang sedang login
router.get('/my-bookings', authenticateToken, getUserBookings); // [cite: 158]

// Mendapatkan semua booking (hanya untuk admin)
router.get('/all', authenticateToken, requireAdmin, getAllBookings); // [cite: 158]
router.post('/by-type', authenticateToken, bookingByTypeValidation, createBookingByType);
// Memperbarui status booking berdasarkan ID (hanya untuk admin)
router.put('/:id/status',
    authenticateToken,       // Pastikan pengguna terautentikasi
    requireAdmin,            // Pastikan pengguna adalah admin
    updateStatusValidation,  // Terapkan aturan validasi untuk pembaruan status
    updateBookingStatus      // Panggil controller jika validasi lolos
); // [cite: 158] // Baris ini dimodifikasi untuk menyertakan updateStatusValidation

// Rute baru untuk mendapatkan ringkasan booking aktif (Admin only)
router.get('/summary/active', authenticateToken, requireAdmin, getActiveBookingsSummary);

module.exports = router;