const express = require('express');
const router = express.Router();
const gcsService = require('../services/gcs-service');

// List all PDF files
router.get('/pdfs', async (req, res) => {
  try {
    const files = await gcsService.listPDFFiles();
    res.json(files);
  } catch (error) {
    console.error('Error listing PDFs:', error);
    res.status(500).json({ error: 'Failed to list PDF files' });
  }
});

// Get signed URL for a specific PDF
router.get('/pdfs/:filename/url', async (req, res) => {
  try {
    const signedUrl = await gcsService.getSignedUrl(req.params.filename);
    res.json({ url: signedUrl });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

module.exports = router; 