const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'app/public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'app/public/uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Accept only PDF files
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Sample data storage (in a real app, this would be a database)
const mockData = {
  documents: [
    {
      id: '1',
      title: 'Urban Farming Guide',
      type: 'guides',
      description: 'A comprehensive guide to urban farming techniques including vertical farming, hydroponics, and community gardens.',
      fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
      thumbnailUrl: 'images/farmyield.png',
      uploadDate: new Date('2023-01-15').toISOString()
    },
    {
      id: '2',
      title: 'Soil Health Research',
      type: 'research',
      description: 'Academic paper on maintaining soil health in urban environments with limited resources and space constraints.',
      fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
      thumbnailUrl: 'images/farmyield.png',
      uploadDate: new Date('2023-02-22').toISOString()
    },
    {
      id: '3',
      title: 'Ancient Agricultural Practices',
      type: 'historical',
      description: 'Historical document detailing agricultural practices in ancient Africa and their applications in modern farming.',
      fileUrl: 'gs://libofk-rawfuelfoods/ancient-agricultural-practices.pdf',
      thumbnailUrl: 'images/farmyield.png',
      uploadDate: new Date('2023-03-10').toISOString()
    },
    {
      id: '4',
      title: 'Sustainable Water Management',
      type: 'guides',
      description: 'Guide to implementing water conservation and management techniques in urban farming environments.',
      fileUrl: 'gs://libofk-rawfuelfoods/sustainable-water-management.pdf',
      thumbnailUrl: 'images/farmyield.png',
      uploadDate: new Date('2023-04-05').toISOString()
    }
  ],
  farmData: [
    { id: 1, cropType: 'Tomatoes', yieldAmount: 250, area: 100, notes: 'Organic heirloom varieties', dateAdded: '2023-04-15' }
  ],
  resourceMetrics: [
    { id: 1, metricType: 'Water Usage', value: 1200, unit: 'gallons', date: '2023-04-10', notes: 'Reduced with drip irrigation' }
  ],
  communityData: [
    { id: 1, programType: 'Workshop', participants: 25, location: 'Downtown Urban Farm', date: '2023-04-20', feedbackScore: 4.8, notes: 'Composting workshop' }
  ]
};

// Routes
// Get all documents
app.get('/api/documents', (req, res) => {
  // Filter documents if query parameters are provided
  const { type, search } = req.query;
  let filteredDocs = [...mockData.documents];
  
  if (type && type !== 'all') {
    filteredDocs = filteredDocs.filter(doc => doc.type === type);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredDocs = filteredDocs.filter(doc => 
      doc.title.toLowerCase().includes(searchLower) || 
      doc.description.toLowerCase().includes(searchLower)
    );
  }
  
  res.json(filteredDocs);
});

// Get a specific document
app.get('/api/documents/:id', (req, res) => {
  const document = mockData.documents.find(doc => doc.id === req.params.id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  res.json(document);
});

// Upload a new document
app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!req.body.title || !req.body.type || !req.body.description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a new document with a direct file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Create a new document
    const newDocument = {
      id: uuidv4(),
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
      fileUrl: fileUrl,
      thumbnailUrl: req.body.thumbnailUrl || 'images/farmyield.png',
      uploadDate: new Date().toISOString()
    };
    
    // Add to documents array
    mockData.documents.push(newDocument);
    
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Delete a document
app.delete('/api/documents/:id', (req, res) => {
  const documentIndex = mockData.documents.findIndex(doc => doc.id === req.params.id);
  
  if (documentIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  // Remove from array
  mockData.documents.splice(documentIndex, 1);
  
  res.json({ message: 'Document deleted successfully' });
});

// Sample API endpoints for data-hub
app.get('/api/farm-data', (req, res) => {
  res.json(mockData.farmData || []);
});

app.get('/api/resource-metrics', (req, res) => {
  res.json(mockData.resourceMetrics || []);
});

app.get('/api/community-impact', (req, res) => {
  res.json(mockData.communityData || []);
});

// Handle cloud storage URLs
app.get('/api/gcs-files/:fileName', (req, res) => {
  // This is a simplified version that just returns a fixed URL
  // In a real app, this would generate a signed URL from GCS
  const fileName = req.params.fileName;
  
  // Convert to a GitHub demo PDF URL since we don't have real GCS access in this demo
  const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
  
  res.json({ url: url });
});

// Route for all html pages
app.get('*.html', (req, res) => {
  const htmlPath = path.join(__dirname, 'app/public', req.path);
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).sendFile(path.join(__dirname, 'app/public/404.html'));
  }
});

// Route for all other routes - serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`View the app at http://localhost:${PORT}`);
  console.log('\nAvailable API endpoints:');
  console.log('- GET    /api/documents');
  console.log('- POST   /api/documents (multipart/form-data with file)');
  console.log('- GET    /api/documents/:id');
  console.log('- DELETE /api/documents/:id');
  console.log('- GET    /api/farm-data');
  console.log('- GET    /api/resource-metrics');
  console.log('- GET    /api/community-impact');
  console.log('- GET    /api/gcs-files/:fileName');
}); 