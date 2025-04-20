const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Set OpenSSL legacy provider for Node.js compatibility
const crypto = require('crypto');
try {
  crypto.setProvider('legacy');
} catch (error) {
  console.warn('Failed to set legacy crypto provider:', error.message);
}

class GCSService {
  constructor() {
    try {
      // Use the same configuration as server.js
      this.storage = new Storage({
        projectId: 'russellnewstorage',
        keyFilename: path.join(__dirname, '..', 'config', 'gcloud-key.json')
      });
      this.bucketName = 'libofk-rawfuelfoods';
      this.bucket = this.storage.bucket(this.bucketName);
      
      console.log('GCS Service initialized successfully');
      console.log('Using bucket:', this.bucketName);
    } catch (error) {
      console.error('Failed to initialize GCS service:', error);
      throw error;
    }
  }

  async listPDFFiles() {
    try {
      console.log('Listing PDF files from bucket:', this.bucketName);
      const [files] = await this.bucket.getFiles({
        prefix: '', // You can specify a folder prefix if needed
        delimiter: '/',
      });

      // Filter for PDF files and format the response
      const pdfFiles = files
        .filter(file => file.name.toLowerCase().endsWith('.pdf'))
        .map(file => ({
          name: file.name,
          id: file.id || file.name, // Use name as ID if ID is not available
          size: parseInt(file.metadata.size, 10),
          updated: file.metadata.updated,
          selfLink: file.metadata.selfLink,
          mediaLink: file.metadata.mediaLink
        }));

      console.log(`Found ${pdfFiles.length} PDF files`);
      return pdfFiles;
    } catch (error) {
      console.error('Error listing PDF files:', error);
      throw error;
    }
  }

  async getSignedUrl(fileName) {
    try {
      console.log('Generating signed URL for:', fileName);
      const file = this.bucket.file(fileName);
      
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`File ${fileName} not found in bucket ${this.bucketName}`);
      }
      
      // Generate a signed URL that expires in 15 minutes
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      console.log('Signed URL generated successfully');
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }
}

module.exports = new GCSService(); 