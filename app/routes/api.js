const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Define schemas
const farmDataSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    cropType: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['Planted', 'Growing', 'Harvested'], required: true }
});

const resourceMetricsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    waterUsage: { type: Number, required: true },
    energyUsage: { type: Number, required: true },
    wasteProduced: { type: Number, required: true }
});

const communityImpactSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    eventType: { type: String, required: true },
    participants: { type: Number, required: true },
    impact: { type: Number, min: 1, max: 10, required: true }
});

// Create models
const FarmData = mongoose.model('FarmData', farmDataSchema);
const ResourceMetrics = mongoose.model('ResourceMetrics', resourceMetricsSchema);
const CommunityImpact = mongoose.model('CommunityImpact', communityImpactSchema);

// Validation middleware
const validateFarmData = [
    body('date').isISO8601(),
    body('cropType').isString().trim().notEmpty(),
    body('quantity').isFloat({ min: 0 }),
    body('status').isIn(['Planted', 'Growing', 'Harvested'])
];

const validateResourceMetrics = [
    body('date').isISO8601(),
    body('waterUsage').isFloat({ min: 0 }),
    body('energyUsage').isFloat({ min: 0 }),
    body('wasteProduced').isFloat({ min: 0 })
];

const validateCommunityImpact = [
    body('date').isISO8601(),
    body('eventType').isString().trim().notEmpty(),
    body('participants').isInt({ min: 0 }),
    body('impact').isInt({ min: 1, max: 10 })
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Helper function to create CRUD routes for a model
const createCRUDRoutes = (router, path, Model, validations) => {
    // Get all records
    router.get(`/${path}`, async (req, res) => {
        try {
            const records = await Model.find().sort('-date');
            res.json(records);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching records', error: error.message });
        }
    });

    // Get single record
    router.get(`/${path}/:id`, async (req, res) => {
        try {
            const record = await Model.findById(req.params.id);
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            res.json(record);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching record', error: error.message });
        }
    });

    // Create record
    router.post(`/${path}`, validations, handleValidationErrors, async (req, res) => {
        try {
            const record = new Model(req.body);
            await record.save();
            res.status(201).json(record);
        } catch (error) {
            res.status(500).json({ message: 'Error creating record', error: error.message });
        }
    });

    // Update record
    router.put(`/${path}/:id`, validations, handleValidationErrors, async (req, res) => {
        try {
            const record = await Model.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            res.json(record);
        } catch (error) {
            res.status(500).json({ message: 'Error updating record', error: error.message });
        }
    });

    // Delete record
    router.delete(`/${path}/:id`, async (req, res) => {
        try {
            const record = await Model.findByIdAndDelete(req.params.id);
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            res.json({ message: 'Record deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting record', error: error.message });
        }
    });
};

// Create routes for each model
createCRUDRoutes(router, 'farmData', FarmData, validateFarmData);
createCRUDRoutes(router, 'resourceMetrics', ResourceMetrics, validateResourceMetrics);
createCRUDRoutes(router, 'communityImpact', CommunityImpact, validateCommunityImpact);

// Additional analytics routes
router.get('/analytics/farm-summary', async (req, res) => {
    try {
        const summary = await FarmData.aggregate([
            {
                $group: {
                    _id: '$cropType',
                    totalQuantity: { $sum: '$quantity' },
                    averageQuantity: { $avg: '$quantity' }
                }
            }
        ]);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error generating summary', error: error.message });
    }
});

router.get('/analytics/resource-trends', async (req, res) => {
    try {
        const trends = await ResourceMetrics.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                    avgWaterUsage: { $avg: '$waterUsage' },
                    avgEnergyUsage: { $avg: '$energyUsage' },
                    totalWaste: { $sum: '$wasteProduced' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        res.json(trends);
    } catch (error) {
        res.status(500).json({ message: 'Error generating trends', error: error.message });
    }
});

router.get('/analytics/community-impact', async (req, res) => {
    try {
        const impact = await CommunityImpact.aggregate([
            {
                $group: {
                    _id: '$eventType',
                    totalParticipants: { $sum: '$participants' },
                    averageImpact: { $avg: '$impact' },
                    eventCount: { $sum: 1 }
                }
            }
        ]);
        res.json(impact);
    } catch (error) {
        res.status(500).json({ message: 'Error generating impact report', error: error.message });
    }
});

module.exports = router; 