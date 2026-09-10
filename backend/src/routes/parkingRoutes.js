const express = require('express');
const router = express.Router();

// ============ SIMPLE TEST ROUTE ============
// This will work immediately without any controllers
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Parking routes are working!' 
    });
});

// ============ PARKING SPOT ROUTES ============

// GET all parking spots
router.get('/parking-spots', (req, res) => {
    res.json({
        success: true,
        message: 'All parking spots retrieved',
        data: [
            { id: 1, spotNumber: 'A1', floor: 1, isAvailable: true },
            { id: 2, spotNumber: 'A2', floor: 1, isAvailable: false },
            { id: 3, spotNumber: 'B1', floor: 2, isAvailable: true }
        ]
    });
});

// GET a specific parking spot by ID
router.get('/parking-spots/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        success: true,
        message: `Parking spot ${id} retrieved`,
        data: { id, spotNumber: `A${id}`, floor: 1, isAvailable: true }
    });
});

// POST - Create a new parking spot
router.post('/parking-spots', (req, res) => {
    const { spotNumber, floor } = req.body;
    
    if (!spotNumber || !floor) {
        return res.status(400).json({
            success: false,
            message: 'Spot number and floor are required'
        });
    }

    res.status(201).json({
        success: true,
        message: 'Parking spot created successfully',
        data: {
            id: Date.now(),
            spotNumber,
            floor,
            isAvailable: true,
            createdAt: new Date().toISOString()
        }
    });
});

// PUT - Update a parking spot
router.put('/parking-spots/:id', (req, res) => {
    const { id } = req.params;
    const { spotNumber, floor, isAvailable } = req.body;
    
    res.json({
        success: true,
        message: `Parking spot ${id} updated`,
        data: {
            id,
            spotNumber: spotNumber || `A${id}`,
            floor: floor || 1,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            updatedAt: new Date().toISOString()
        }
    });
});

// DELETE - Remove a parking spot
router.delete('/parking-spots/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        success: true,
        message: `Parking spot ${id} deleted successfully`
    });
});

// ============ PARKING OPERATIONS ============

// POST - Park a car
router.post('/park/:spotId', (req, res) => {
    const { spotId } = req.params;
    const { carNumber, ownerName, phone } = req.body;
    
    if (!carNumber) {
        return res.status(400).json({
            success: false,
            message: 'Car number is required'
        });
    }

    res.json({
        success: true,
        message: `Car parked in spot ${spotId}`,
        data: {
            spotId,
            carNumber,
            ownerName: ownerName || 'Unknown',
            phone: phone || 'Not provided',
            parkedAt: new Date().toISOString()
        }
    });
});

// DELETE - Unpark a car
router.delete('/unpark/:spotId', (req, res) => {
    const { spotId } = req.params;
    res.json({
        success: true,
        message: `Car removed from spot ${spotId}`,
        data: {
            spotId,
            unparkedAt: new Date().toISOString()
        }
    });
});

// ============ STATUS & AVAILABILITY ============

// GET - Check parking availability
router.get('/availability', (req, res) => {
    res.json({
        success: true,
        data: {
            totalSpots: 50,
            availableSpots: 35,
            occupiedSpots: 15,
            availabilityPercentage: 70
        }
    });
});

// GET - Parking status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'operational',
            lastUpdated: new Date().toISOString(),
            totalCarsParked: 15
        }
    });
});

// GET - Parking statistics
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            totalParkingSpots: 50,
            occupied: 15,
            available: 35,
            dailyRevenue: 4500,
            monthlyRevenue: 135000
        }
    });
});

// ============ EXPORT ============
module.exports = router;