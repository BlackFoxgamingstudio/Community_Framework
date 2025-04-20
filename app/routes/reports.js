const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateReport = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').isIn(['Farm', 'Resource', 'Community']).withMessage('Invalid report type'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('summary').trim().notEmpty().withMessage('Summary is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
];

// Get all reports with optional filtering
router.get('/', (req, res) => {
    try {
        const { type, search } = req.query;
        let filteredReports = req.app.locals.mockDb.reports;
        
        if (type && type !== 'all') {
            filteredReports = filteredReports.filter(report => report.type === type);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            filteredReports = filteredReports.filter(report => 
                report.title.toLowerCase().includes(searchLower) ||
                report.summary.toLowerCase().includes(searchLower) ||
                report.content.toLowerCase().includes(searchLower)
            );
        }
        
        res.json(filteredReports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
});

// Get single report
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const report = req.app.locals.mockDb.reports.find(r => r.id === id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching report', error: error.message });
    }
});

// Create new report
router.post('/', validateReport, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newReport = {
            id: Math.max(...req.app.locals.mockDb.reports.map(r => r.id), 0) + 1,
            ...req.body,
            date: new Date().toISOString().split('T')[0]
        };
        
        req.app.locals.mockDb.reports.push(newReport);
        res.status(201).json(newReport);
    } catch (error) {
        res.status(500).json({ message: 'Error creating report', error: error.message });
    }
});

// Update report
router.put('/:id', validateReport, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = parseInt(req.params.id);
        const index = req.app.locals.mockDb.reports.findIndex(r => r.id === id);
        
        if (index === -1) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        req.app.locals.mockDb.reports[index] = {
            ...req.app.locals.mockDb.reports[index],
            ...req.body,
            id: id // Ensure ID doesn't change
        };
        
        res.json(req.app.locals.mockDb.reports[index]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating report', error: error.message });
    }
});

// Delete report
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const initialLength = req.app.locals.mockDb.reports.length;
        
        req.app.locals.mockDb.reports = req.app.locals.mockDb.reports.filter(r => r.id !== id);
        
        if (req.app.locals.mockDb.reports.length === initialLength) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report', error: error.message });
    }
});

module.exports = router; 