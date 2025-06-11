const { validationResult } = require('express-validator'); // [cite: 57]
const db = require('../config/database'); // [cite: 57]
const path = require('path'); // [cite: 57]
const fs = require('fs').promises; // [cite: 57]

// Get all cars
const getAllCars = async (req, res) => { // [cite: 58]
    try {
        const [cars] = await db.execute( // [cite: 58]
            'SELECT id, model, license_plate, year, price, image, available FROM cars ORDER BY created_at DESC' // [cite: 58]
        );
        res.json({ // [cite: 59]
            success: true, // [cite: 59]
            data: cars // [cite: 59]
        });
    } catch (error) { // [cite: 60]
        console.error('Get cars error:', error); // [cite: 60]
        res.status(500).json({ // [cite: 61]
            success: false, // [cite: 61]
            message: 'Failed to fetch cars' // [cite: 61]
        });
    }
};

// Get single car
const getCarById = async (req, res) => { // [cite: 62]
    try {
        const { id } = req.params; // [cite: 62]
        const [cars] = await db.execute( // [cite: 63]
            'SELECT * FROM cars WHERE id = ?', // [cite: 63]
            [id] // [cite: 63]
        );
        if (cars.length === 0) { // [cite: 64]
            return res.status(404).json({ // [cite: 64]
                success: false, // [cite: 64]
                message: 'Car not found' // [cite: 64]
            });
        }

        res.json({ // [cite: 65]
            success: true, // [cite: 65]
            data: cars[0] // [cite: 65]
        });
    } catch (error) { // [cite: 66]
        console.error('Get car error:', error); // [cite: 66]
        res.status(500).json({ // [cite: 67]
            success: false, // [cite: 67]
            message: 'Failed to fetch car' // [cite: 67]
        });
    }
};

// Add new car (Admin only)
const addCar = async (req, res) => { // [cite: 68]
    try {
        // Check for validation errors
        const errors = validationResult(req); // [cite: 68]
        if (!errors.isEmpty()) { // [cite: 69]
            return res.status(400).json({ // [cite: 69]
                success: false, // [cite: 69]
                message: 'Validation failed', // [cite: 69]
                errors: errors.array() // [cite: 69]
            });
        }

        const { model, license_plate, year, price } = req.body; // [cite: 70]
        const image = req.file ? req.file.filename : null; // [cite: 71]

        const [result] = await db.execute( // [cite: 71]
            'INSERT INTO cars (model, license_plate, year, price, image) VALUES (?, ?, ?, ?, ?)', // [cite: 71]
            [model, license_plate, year, price, image] // [cite: 71]
        );

        // Get the created car
        const [newCar] = await db.execute( // [cite: 72]
            'SELECT * FROM cars WHERE id = ?', // [cite: 72]
            [result.insertId] // [cite: 72]
        );

        res.status(201).json({ // [cite: 73]
            success: true, // [cite: 73]
            message: 'Car added successfully', // [cite: 73]
            data: newCar[0] // [cite: 73]
        });
    } catch (error) { // [cite: 74]
if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'License Plate cannot be same as other car.'
            });
        }
        // --- AKHIR LOGIKA TAMBAHAN ---

        console.error('Add car error:', error);
        res.status(500).json({
            success: false,
            message: 'There is an error on the server when trying to add new car.'
        });
    }
};

// Update car (Admin only)
const updateCar = async (req, res) => { // [cite: 76]
    try {
        const { id } = req.params; // [cite: 76]
        const { model, license_plate, year, price, available } = req.body; // [cite: 77]

        // Check if car exists
        const [existingCar] = await db.execute( // [cite: 77]
            'SELECT * FROM cars WHERE id = ?', // [cite: 77]
            [id] // [cite: 77]
        );
        if (existingCar.length === 0) { // [cite: 78]
            return res.status(404).json({ // [cite: 78]
                success: false, // [cite: 78]
                message: 'Car not found' // [cite: 78]
            });
        }

        let updateQuery = 'UPDATE cars SET model = ?, license_plate = ?, year = ?, price = ?, available = ?'; // [cite: 79]
        let updateParams = [model, license_plate, year, price, available]; // [cite: 80]

        // Handle image update
        if (req.file) { // [cite: 80]
            updateQuery += ', image = ?'; // [cite: 80]
            updateParams.push(req.file.filename); // [cite: 81]

            // Delete old image if exists
            if (existingCar[0].image) { // [cite: 81]
                try {
                    await fs.unlink(path.join(__dirname, '../uploads', existingCar[0].image)); // [cite: 81]
                } catch (err) { // [cite: 82]
                    console.error('Failed to delete old image:', err); // [cite: 82]
                }
            }
        }

        updateQuery += ' WHERE id = ?'; // [cite: 83]
        updateParams.push(id); // [cite: 84]

        await db.execute(updateQuery, updateParams); // [cite: 84]

        // Get updated car
        const [updatedCar] = await db.execute( // [cite: 84]
            'SELECT * FROM cars WHERE id = ?', // [cite: 84]
            [id] // [cite: 84]
        );
        res.json({ // [cite: 85]
            success: true, // [cite: 85]
            message: 'Car updated successfully', // [cite: 85]
            data: updatedCar[0] // [cite: 85]
        });
    } catch (error) { // [cite: 86]
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Plat Nomor tidak boleh sama, sudah terdaftar.'
            });
        }
        
        console.error('Update car error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui mobil.'
        });
    }
};

// Delete car (Admin only)
const deleteCar = async (req, res) => { // [cite: 88]
    try {
        const { id } = req.params; // [cite: 88]
        // Check if car exists
        const [existingCar] = await db.execute( // [cite: 89]
            'SELECT * FROM cars WHERE id = ?', // [cite: 89]
            [id] // [cite: 89]
        );
        if (existingCar.length === 0) { // [cite: 90]
            return res.status(404).json({ // [cite: 90]
                success: false, // [cite: 90]
                message: 'Car not found' // [cite: 90]
            });
        }

        // Check if car has active bookings
        const [activeBookings] = await db.execute( // [cite: 91]
            'SELECT id FROM bookings WHERE car_id = ? AND status IN ("pending", "confirmed")', // [cite: 91]
            [id] // [cite: 91]
        );
        if (activeBookings.length > 0) { // [cite: 92]
            return res.status(400).json({ // [cite: 92]
                success: false, // [cite: 92]
                message: 'Cannot delete car with active bookings' // [cite: 92]
            });
        }

        // Delete car
        await db.execute('DELETE FROM cars WHERE id = ?', [id]); // [cite: 93]
        // Delete image file if exists
        if (existingCar[0].image) { // [cite: 94]
            try {
                await fs.unlink(path.join(__dirname, '../uploads', existingCar[0].image)); // [cite: 94]
            } catch (err) { // [cite: 95]
                console.error('Failed to delete image:', err); // [cite: 95]
            }
        }

        res.json({ // [cite: 96]
            success: true, // [cite: 96]
            message: 'Car deleted successfully' // [cite: 96]
        });
    } catch (error) { // [cite: 97]
        console.error('Delete car error:', error); // [cite: 97]
        res.status(500).json({ // [cite: 98]
            success: false, // [cite: 98]
            message: 'Failed to delete car' // [cite: 98]
        });
    }
};

const getPopularCars = async (req, res) => {
    try {
        const [popularCars] = await db.execute('SELECT * FROM popularcarsview LIMIT 10'); // Ambil 10 teratas
        res.json({
            success: true,
            data: popularCars
        });
    } catch (error) {
        console.error('Get popular cars error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular cars'
        });
    }
};

const getCarAvailabilityDetails = async (req, res) => {
    try {
        const [cars] = await db.execute('SELECT * FROM caravailabilitydetails ORDER BY model ASC');
        res.json({
            success: true,
            data: cars
        });
    } catch (error) {
        console.error('Get car availability details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch car availability details'
        });
    }
};

module.exports = {
    getAllCars, // [cite: 99]
    getCarById, // [cite: 99]
    addCar, // [cite: 99]
    updateCar, // [cite: 100]
    deleteCar, // [cite: 100]
    getPopularCars,
    getCarAvailabilityDetails
};