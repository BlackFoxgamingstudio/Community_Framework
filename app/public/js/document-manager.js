class DocumentManager {
  constructor() {
    this.pdfFiles = [];
    this.documentsContainer = document.getElementById('documentsContainer');
    this.loadingElement = document.querySelector('.pdf-loading');
    this.errorElement = document.querySelector('.pdf-error');
    
    // Hide error initially
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
    
    this.loadPDFFiles();
  }

  async loadPDFFiles() {
    try {
      this.showLoading();
      console.log('Fetching PDF files from server...');
      
      const response = await fetch('/api/pdfs');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch PDF files');
      }
      
      this.pdfFiles = await response.json();
      console.log('PDF files loaded:', this.pdfFiles);
      
      this.displayPDFFiles();
      this.hideLoading();
    } catch (error) {
      console.error('Error loading PDF files:', error);
      this.showError('Failed to load PDF files: ' + error.message);
      this.hideLoading();
    }
  }

  async getSignedUrl(filename) {
    try {
      console.log('Getting signed URL for:', filename);
      
      const response = await fetch(`/api/pdfs/${encodeURIComponent(filename)}/url`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get signed URL');
      }
      
      const data = await response.json();
      console.log('Signed URL received');
      return data.url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      this.showError('Failed to get PDF URL: ' + error.message);
      throw error;
    }
  }

  displayPDFFiles() {
    if (!this.documentsContainer) {
      console.error('Documents container not found');
      return;
    }

    this.documentsContainer.innerHTML = '';

    if (this.pdfFiles.length === 0) {
      console.log('No PDF files found');
      this.documentsContainer.innerHTML = '<div class="no-documents">No PDF documents found</div>';
      return;
    }

    console.log('Displaying', this.pdfFiles.length, 'PDF files');

    this.pdfFiles.forEach(file => {
      const card = document.createElement('div');
      card.className = 'document-card';
      
      const updatedDate = new Date(file.updated).toLocaleDateString();
      const fileSize = this.formatFileSize(file.size);

      card.innerHTML = `
        <div class="document-thumbnail">
          <i class="fas fa-file-pdf fa-3x"></i>
        </div>
        <div class="document-info">
          <h3>${file.name}</h3>
          <div class="document-meta">
            <span>${updatedDate}</span>
            <span>${fileSize}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', async () => {
        try {
          this.showLoading();
          console.log('Opening PDF:', file.name);
          
          const signedUrl = await this.getSignedUrl(file.name);
          await this.openPDFViewer(signedUrl);
          
          this.hideLoading();
        } catch (error) {
          console.error('Failed to open PDF:', error);
          this.showError('Failed to open PDF: ' + error.message);
          this.hideLoading();
        }
      });

      this.documentsContainer.appendChild(card);
    });
  }

  async openPDFViewer(url) {
    if (!url) {
      throw new Error('No URL provided');
    }

    const modal = document.getElementById('documentViewModal');
    if (!modal) {
      throw new Error('Modal element not found');
    }

    modal.style.display = 'block';
    
    if (window.pdfViewer) {
      await window.pdfViewer.loadPDF(url);
    } else {
      throw new Error('PDF viewer not initialized');
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'flex';
    }
  }

  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  showError(message) {
    console.error(message);
    if (this.errorElement) {
      this.errorElement.textContent = message;
      this.errorElement.style.display = 'flex';
    }
  }

  hideError() {
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
  }
}

// Initialize document manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing document manager...');
  window.documentManager = new DocumentManager();
}); 