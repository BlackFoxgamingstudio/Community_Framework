require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./routes');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const fs = require('fs').promises;
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pdfRoutes = require('./routes/pdf-routes');

// Set OpenSSL legacy provider for Node.js compatibility
try {
  crypto.setProvider('legacy');
} catch (error) {
  console.warn('Failed to set legacy crypto provider:', error.message);
}

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable detailed logging
const logRequest = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', req.body);
    }
    if (req.query && Object.keys(req.query).length > 0) {
        console.log('Query params:', req.query);
    }
    next();
};

app.use(logRequest);

// Configure file storage and upload
// Initialize Google Cloud Storage
const storage = new Storage({
    projectId: 'russellnewstorage',
    keyFilename: path.join(__dirname, 'config', 'gcloud-key.json')
});
const bucketName = 'libofk-rawfuelfoods';
const bucket = storage.bucket(bucketName);

// Log GCS configuration on startup
console.log('Google Cloud Storage Configuration:');
console.log('- Project ID:', 'russellnewstorage');
console.log('- Bucket Name:', bucketName);
console.log('- Key File Path:', path.join(__dirname, 'config', 'gcloud-key.json'));

// Configure multer for file uploads
const diskStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    
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
  storage: diskStorage,
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

// Mock database
const mockData = {
    farmData: [
        { id: 1, cropType: 'Tomatoes', yieldAmount: 500, area: 100, notes: 'Organic heirloom varieties', dateAdded: '2024-04-19' },
        { id: 2, cropType: 'Lettuce', yieldAmount: 300, area: 50, notes: 'Hydroponic system - Mixed greens', dateAdded: '2024-04-18' },
        { id: 3, cropType: 'Peppers', yieldAmount: 250, area: 75, notes: 'Bell and hot varieties', dateAdded: '2024-04-17' },
        { id: 4, cropType: 'Herbs', yieldAmount: 150, area: 25, notes: 'Basil, cilantro, mint mix', dateAdded: '2024-04-16' },
        { id: 5, cropType: 'Microgreens', yieldAmount: 100, area: 10, notes: 'High-density indoor setup', dateAdded: '2024-04-15' }
    ],
    resourceMetrics: [
        { id: 1, metricType: 'Water Usage', value: 1200, unit: 'gallons', date: '2024-04-19', notes: 'Reduced with drip irrigation' },
        { id: 2, metricType: 'Energy Usage', value: 500, unit: 'kWh', date: '2024-04-18', notes: 'Solar panels installed' },
        { id: 3, metricType: 'Compost', value: 300, unit: 'lbs', date: '2024-04-17', notes: 'Kitchen waste recycling' },
        { id: 4, metricType: 'Water Usage', value: 1000, unit: 'gallons', date: '2024-04-16', notes: 'Rainwater collection' },
        { id: 5, metricType: 'Energy Usage', value: 450, unit: 'kWh', date: '2024-04-15', notes: 'LED lighting upgrade' }
    ],
    communityData: [
        { id: 1, programType: 'Workshop', participants: 25, location: 'Main Farm', date: '2024-04-19', feedbackScore: 4.5, notes: 'Urban farming basics' },
        { id: 2, programType: 'Education', participants: 15, location: 'Community Center', date: '2024-04-18', feedbackScore: 4.8, notes: 'School program' },
        { id: 3, programType: 'Volunteer', participants: 30, location: 'Urban Garden', date: '2024-04-17', feedbackScore: 4.7, notes: 'Weekend cleanup' },
        { id: 4, programType: 'Workshop', participants: 20, location: 'Greenhouse', date: '2024-04-16', feedbackScore: 4.6, notes: 'Composting tutorial' },
        { id: 5, programType: 'Education', participants: 18, location: 'Local School', date: '2024-04-15', feedbackScore: 4.9, notes: 'Youth engagement' }
    ],
    reports: [
        { 
            id: 1, 
            title: 'Q1 Farm Performance Report', 
            type: 'farm', 
            author: 'John Smith', 
            date: '2024-04-19', 
            summary: 'Comprehensive analysis of Q1 farm yields and efficiency' 
        },
        { 
            id: 2, 
            title: 'Resource Efficiency Analysis', 
            type: 'resource', 
            author: 'Emma Davis', 
            date: '2024-04-18', 
            summary: 'Monthly resource usage and sustainability metrics' 
        },
        { 
            id: 3, 
            title: 'Community Impact Assessment', 
            type: 'community', 
            author: 'Michael Brown', 
            date: '2024-04-17', 
            summary: 'Evaluation of community programs and engagement' 
        },
        { 
            id: 4, 
            title: 'Sustainability Progress Report', 
            type: 'resource', 
            author: 'Sarah Wilson', 
            date: '2024-04-16', 
            summary: 'Analysis of environmental impact and sustainability initiatives' 
        },
        { 
            id: 5, 
            title: 'Educational Program Results', 
            type: 'community', 
            author: 'David Lee', 
            date: '2024-04-15', 
            summary: 'Overview of educational programs and participant feedback' 
        }
    ],
    documents: []
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// First serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Document Management API Routes
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
    
    let fileUrl = '';
    
    // Determine if we should upload to GCS or use local file
    const useCloudStorage = process.env.USE_CLOUD_STORAGE === 'true';
    
    if (useCloudStorage) {
      // Upload to Google Cloud Storage
      try {
        // Create a unique destination filename
        const fileName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        // Upload options
        const options = {
          destination: fileName,
          metadata: {
            contentType: req.file.mimetype,
            metadata: {
              title: req.body.title,
              type: req.body.type,
              description: req.body.description
            }
          }
        };
        
        // Upload the file to GCS
        await bucket.upload(req.file.path, options);
        
        // Make the file public
        const file = bucket.file(fileName);
        await file.makePublic();
        
        // Set the file URL to the GCS URL
        fileUrl = `gs://${bucketName}/${fileName}`;
        
        // Also create a direct HTTP URL for easy access
        const httpUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        console.log(`File uploaded to GCS: ${httpUrl}`);
        
        // Clean up temp file
        await fs.unlink(req.file.path);
      } catch (error) {
        console.error('Error uploading to GCS:', error);
        return res.status(500).json({ error: 'Failed to upload to cloud storage' });
      }
    } else {
      // Use the local file path
      fileUrl = `/uploads/${req.file.filename}`;
    }
    
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

// Get content from a Google Cloud Storage file
app.get('/api/gcs-files/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const file = bucket.file(fileName);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get signed URL for file (valid for 15 minutes)
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    
    res.json({ url });
  } catch (error) {
    console.error('Error getting GCS file:', error);
    res.status(500).json({ error: 'Failed to get file from cloud storage' });
  }
});

// API Routes with enhanced error handling and validation
app.get('/api/farm-data', (req, res) => {
    console.log('GET /api/farm-data');
    res.json(mockData.farmData);
});

app.post('/api/farm-data', (req, res) => {
    const newData = { 
        id: mockData.farmData.length > 0 ? Math.max(...mockData.farmData.map(d => d.id)) + 1 : 1,
        ...req.body 
    };
    mockData.farmData.push(newData);
    res.status(201).json(newData);
});

app.put('/api/farm-data/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockData.farmData.findIndex(d => d.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Record not found' });
    }
    
    mockData.farmData[index] = { ...mockData.farmData[index], ...req.body, id };
    res.json(mockData.farmData[index]);
});

app.delete('/api/farm-data/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockData.farmData.findIndex(d => d.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Record not found' });
    }
    
    mockData.farmData.splice(index, 1);
    res.json({ message: 'Record deleted successfully' });
});

app.get('/api/resource-metrics', (req, res) => {
    res.json(mockData.resourceMetrics);
});

app.post('/api/resource-metrics', (req, res) => {
    const newMetric = { 
        id: mockData.resourceMetrics.length > 0 ? Math.max(...mockData.resourceMetrics.map(d => d.id)) + 1 : 1,
        ...req.body 
    };
    mockData.resourceMetrics.push(newMetric);
    res.status(201).json(newMetric);
});

app.put('/api/resource-metrics/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockData.resourceMetrics.findIndex(d => d.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Record not found' });
    }
    
    mockData.resourceMetrics[index] = { ...mockData.resourceMetrics[index], ...req.body, id };
    res.json(mockData.resourceMetrics[index]);
});

app.delete('/api/resource-metrics/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockData.resourceMetrics.findIndex(d => d.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Record not found' });
    }
    
    mockData.resourceMetrics.splice(index, 1);
    res.json({ message: 'Record deleted successfully' });
});

app.get('/api/community-impact', (req, res) => {
    res.json(mockData.communityData);
});

app.post('/api/community-impact', (req, res) => {
    const newImpact = { 
        id: mockData.communityData.length > 0 ? Math.max(...mockData.communityData.map(d => d.id)) + 1 : 1,
        ...req.body 
    };
    mockData.communityData.push(newImpact);
    res.status(201).json(newImpact);
});

app.put('/api/community-impact/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockData.communityData.findIndex(d => d.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Record not found' });
    }
    
    mockData.communityData[index] = { ...mockData.communityData[index], ...req.body, id };
    res.json(mockData.communityData[index]);
});

app.delete('/api/community-impact/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockData.communityData.findIndex(d => d.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Record not found' });
    }
    
    mockData.communityData.splice(index, 1);
    res.json({ message: 'Record deleted successfully' });
});

app.get('/api/reports', (req, res) => {
    const { type, search } = req.query;
    let filteredReports = mockData.reports;
    
    if (type && type !== 'all') {
        filteredReports = filteredReports.filter(report => report.type === type);
    }
    
    if (search) {
        const searchLower = search.toLowerCase();
        filteredReports = filteredReports.filter(report => 
            report.title.toLowerCase().includes(searchLower) ||
            report.summary.toLowerCase().includes(searchLower)
        );
    }
    
    res.json(filteredReports);
});

app.post('/api/reports', (req, res) => {
    const newReport = { id: mockData.reports.length + 1, ...req.body };
    mockData.reports.push(newReport);
    res.status(201).json(newReport);
});

// Get a specific report
app.get('/api/reports/:id', (req, res) => {
    const report = mockData.reports.find(r => r.id === parseInt(req.params.id));
    
    if (!report) {
        return res.status(404).json({ error: 'Report not found' });
    }
    
    // Add some sample content for the report
    const fullReport = {
        ...report,
        content: `
            <h3>Executive Summary</h3>
            <p>This is a sample report content for ${report.title}.</p>
            
            <h3>Key Findings</h3>
            <ul>
                <li>Finding 1: Sample data point</li>
                <li>Finding 2: Another data point</li>
                <li>Finding 3: Final data point</li>
            </ul>
            
            <h3>Metrics</h3>
            <div class="metrics">
                <div class="metric-card">
                    <div class="metric-value">85%</div>
                    <div class="metric-label">Efficiency</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">92%</div>
                    <div class="metric-label">Satisfaction</div>
                </div>
            </div>
            
            <h3>Recommendations</h3>
            <div class="recommendations">
                <p>Based on our analysis, we recommend the following actions:</p>
                <ul>
                    <li>Recommendation 1: Implement new processes</li>
                    <li>Recommendation 2: Optimize resource allocation</li>
                    <li>Recommendation 3: Enhance monitoring systems</li>
                </ul>
            </div>
        `
    };
    
    res.json(fullReport);
});

// Update a report
app.put('/api/reports/:id', (req, res) => {
    const reportIndex = mockData.reports.findIndex(r => r.id === parseInt(req.params.id));
    
    if (reportIndex === -1) {
        return res.status(404).json({ error: 'Report not found' });
    }
    
    mockData.reports[reportIndex] = {
        ...mockData.reports[reportIndex],
        ...req.body,
        id: parseInt(req.params.id)
    };
    
    res.json(mockData.reports[reportIndex]);
});

// Delete a report
app.delete('/api/reports/:id', (req, res) => {
    const reportIndex = mockData.reports.findIndex(r => r.id === parseInt(req.params.id));
    
    if (reportIndex === -1) {
        return res.status(404).json({ error: 'Report not found' });
    }
    
    mockData.reports.splice(reportIndex, 1);
    res.json({ message: 'Report deleted successfully' });
});

// Use PDF routes
app.use('/api', pdfRoutes);

// Then handle all routes
app.use('/', routes);

// Handle 404s - this should be after all other routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handling middleware - now with logging
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Static files are served from: ${path.join(__dirname, 'public')}`);
    console.log(`Using Google Cloud Storage bucket: ${bucketName}`);
    console.log('Available API endpoints:');
    console.log('- GET    /api/documents');
    console.log('- POST   /api/documents (multipart/form-data with file)');
    console.log('- GET    /api/documents/:id');
    console.log('- DELETE /api/documents/:id');
    console.log('- GET  /api/farm-data');
    console.log('- GET  /api/resource-metrics');
    console.log('- GET  /api/community-impact');
    console.log('- GET  /api/reports');
}); 