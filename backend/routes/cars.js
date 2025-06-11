const express = require('express'); // [cite: 146]
const multer = require('multer'); // [cite: 147]
const path = require('path'); // [cite: 147]
const { body } = require('express-validator'); // [cite: 147]
const {
    getAllCars,
    getCarById,
    addCar,
    updateCar,
    deleteCar,
    getPopularCars,
    getCarAvailabilityDetails,
    getCarModels
} = require('../controllers/carController'); // [cite: 148]
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // [cite: 149]

const router = express.Router(); // [cite: 149]

// Configure multer for file uploads
const storage = multer.diskStorage({ // [cite: 150]
    destination: function (req, file, cb) { // [cite: 150]
        cb(null, 'uploads/'); // [cite: 150]
    },
    filename: function (req, file, cb) { // [cite: 150]
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)); // [cite: 150]
    }
});
const upload = multer({ // [cite: 151]
    storage: storage, // [cite: 151]
    limits: { // [cite: 151]
        fileSize: 5 * 1024 * 1024 // 5MB limit // [cite: 151]
    },
    fileFilter: function (req, file, cb) { // [cite: 151]
        if (file.mimetype.startsWith('image/')) { // [cite: 151]
            cb(null, true); // [cite: 151]
        } else {
            cb(new Error('Only image files are allowed!'), false); // [cite: 151]
        }
    }
});


// Validation rules
const carValidation = [ // [cite: 152]
    body('model').notEmpty().withMessage('Model is required'), // [cite: 152]
    body('license_plate').notEmpty().withMessage('License plate is required'), // [cite: 152]
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'), // [cite: 152]
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required') // [cite: 152]
];


// Routes untuk view popular cars dan car availability details
router.get('/availability', getCarAvailabilityDetails);
router.get('/popular', authenticateToken, requireAdmin, getPopularCars);
router.get('/models', authenticateToken, requireAdmin, getCarModels);
router.get('/', getAllCars); // [cite: 153]
router.get('/:id', getCarById); // [cite: 153]
router.post('/', authenticateToken, requireAdmin, upload.single('image'), carValidation, addCar); // [cite: 153]
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), updateCar); // [cite: 153] // Note: carValidation tidak diterapkan di PUT di kode asli, bisa ditambahkan jika perlu validasi semua field saat update
router.delete('/:id', authenticateToken, requireAdmin, deleteCar); // [cite: 153]

module.exports = router; // [cite: 154]