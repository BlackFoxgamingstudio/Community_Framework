const storageConfig = {
  gcp: {
    projectId: 'russellnewstrorage',
    bucket: 'libofk',
    uploadLimits: {
      pdf: 10 * 1024 * 1024, // 10MB
      image: 5 * 1024 * 1024  // 5MB
    },
    allowedTypes: {
      pdf: ['application/pdf'],
      image: ['image/jpeg', 'image/png', 'image/webp']
    },
    paths: {
      documents: 'documents',
      thumbnails: 'thumbnails'
    },
    urlExpiration: '03-01-2500' // Long-lived URLs for simplicity
  }
};

module.exports = storageConfig; 