const express = require('express');
const path = require('path');
const router = express.Router();

// Helper function to send HTML files
const sendHTML = (fileName) => (req, res) => {
    res.sendFile(path.join(__dirname, 'public', fileName));
};

// Main routes
router.get('/', sendHTML('index.html'));
router.get('/about', sendHTML('about.html'));
router.get('/blog', sendHTML('blog.html'));
router.get('/data-hub', sendHTML('data-hub.html'));
router.get('/events', sendHTML('events.html'));
router.get('/communications', sendHTML('communications.html'));
router.get('/farm', sendHTML('farm.html'));
router.get('/health-wellness', sendHTML('health.html'));
router.get('/food', sendHTML('food.html'));
router.get('/networks', sendHTML('networks.html'));
router.get('/outdoors-rx', sendHTML('outdoors-rx.html'));
router.get('/pdf-library-docs', sendHTML('pdf_library_framework_docs.html'));

// Farm sub-routes
router.get('/farms/locations', sendHTML('farm-locations.html'));
router.get('/farms/products', sendHTML('farm-products.html'));
router.get('/farms/sustainability', sendHTML('farm-sustainability.html'));
router.get('/farms/partners', sendHTML('farm-partners.html'));

// Eat & Drink sub-routes
router.get('/eat-drink/menu', sendHTML('menu.html'));
router.get('/eat-drink/specials', sendHTML('specials.html'));
router.get('/eat-drink/catering', sendHTML('catering.html'));
router.get('/eat-drink/events', sendHTML('food-events.html'));

// Health/Wellness sub-routes
router.get('/health-wellness/programs', sendHTML('wellness-programs.html'));
router.get('/health-wellness/nutrition', sendHTML('nutrition.html'));
router.get('/health-wellness/coaching', sendHTML('coaching.html'));
router.get('/health-wellness/resources', sendHTML('wellness-resources.html'));

// Networks sub-routes
router.get('/networks/partners', sendHTML('network-partners.html'));
router.get('/networks/community', sendHTML('network-community.html'));
router.get('/networks/initiatives', sendHTML('network-initiatives.html'));

// Events sub-routes
router.get('/events/calendar', sendHTML('events-calendar.html'));
router.get('/events/workshops', sendHTML('events-workshops.html'));
router.get('/events/classes', sendHTML('events-classes.html'));
router.get('/events/special', sendHTML('events-special.html'));

// Error handling for undefined routes
router.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

module.exports = router; 