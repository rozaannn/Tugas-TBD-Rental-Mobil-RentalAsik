const { validationResult } = require('express-validator'); // [cite: 57]
const db = require('../config/database'); // [cite: 57]
const path = require('path'); // [cite: 57]
const fs = require('fs').promises; // [cite: 57]

// Get all cars
const getAllCars = async (req, res) => { // [cite: 58]
    try {
        const [cars] = await db.execute( // [cite: 58]
            'SELECT id, model, license_plate, year, price, image, available FROM cars ORDER BY model ASC, year DESC' // [cite: 58]
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
const addCar = async (req, res) => {
    try {
        // Validation from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { model, license_plate, year, price } = req.body;
        const image = req.file ? req.file.filename : null;

        // --- NEW LOGIC: PRICE CONSISTENCY CHECK ---
        // Check if a car with the same model and year already exists
        const [existingCars] = await db.execute(
            'SELECT price FROM cars WHERE model = ? AND year = ? LIMIT 1',
            [model, year]
        );

        // If the model exists, we must check if the price is consistent
        if (existingCars.length > 0) {
            const existingPrice = parseFloat(existingCars[0].price);
            const submittedPrice = parseFloat(price);

            // If the submitted price is different, send a specific error
            if (existingPrice !== submittedPrice) {
                return res.status(400).json({
                    success: false,
                    message: "To change the price for an existing model, please use the edit car feature."
                });
            }
        }
        // --- END OF NEW LOGIC ---

        // If the code reaches here, it means it's either a new model,
        // or it's an existing model with the correct price. Proceed to insert.
        await db.execute(
            'INSERT INTO cars (model, license_plate, year, price, image, available) VALUES (?, ?, ?, ?, ?, ?)',
            [model, license_plate, year, price, image, true] // Assuming new cars are available by default
        );
        
        // We can just send a success message without fetching the new car again
        res.status(201).json({ 
            success: true, 
            message: 'Car added successfully!' 
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'License plate already exists.'
            });
        }
        
        console.error('Add car error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred on the server while adding the car.'
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

//fungsi untuk mendapatkan daftar model mobil
const getCarModels = async (req, res) => {
    try {
        // Query ini mengambil satu baris per kombinasi model-tahun,
        // yang efektif memberikan daftar tipe mobil yang unik.
        const [models] = await db.execute(
            `SELECT DISTINCT model, year, price FROM cars ORDER BY model ASC, year DESC`
        );
        res.json({
            success: true,
            data: models
        });
    } catch (error) {
        console.error('Get car models error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch car models'
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
    getCarAvailabilityDetails,
    getCarModels
};