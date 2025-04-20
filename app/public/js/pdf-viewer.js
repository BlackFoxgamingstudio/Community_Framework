/**
 * PDF Viewer Management
 * Requires PDF.js library: https://mozilla.github.io/pdf.js/
 */

class PdfViewer {
  constructor() {
    // PDF viewer elements
    this.pdfViewerModal = $('#pdfViewerModal');
    this.pdfCanvas = document.getElementById('pdfCanvas');
    this.ctx = this.pdfCanvas.getContext('2d');
    this.pageNum = document.getElementById('pageNum');
    this.pageCount = document.getElementById('pageCount');
    this.prevButton = document.getElementById('prevPage');
    this.nextButton = document.getElementById('nextPage');
    this.zoomIn = document.getElementById('zoomIn');
    this.zoomOut = document.getElementById('zoomOut');
    this.zoomLevel = document.getElementById('zoomLevel');
    this.documentType = document.getElementById('documentType');
    this.documentDate = document.getElementById('documentDate');
    this.downloadPdf = document.getElementById('downloadPdf');
    this.loadingDiv = document.querySelector('#pdfViewerContainer .loading');
    
    // PDF state
    this.currentPDF = null;
    this.currentPage = 1;
    this.scale = 1.0;
    this.currentUrl = null;
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    this.prevButton.addEventListener('click', () => this.previousPage());
    this.nextButton.addEventListener('click', () => this.nextPage());
    this.zoomIn.addEventListener('click', () => this.zoom(0.1));
    this.zoomOut.addEventListener('click', () => this.zoom(-0.1));
    
    // Reset viewer state when modal is closed
    this.pdfViewerModal.on('hidden.bs.modal', () => {
      if (this.currentPDF) {
        this.currentPDF.destroy();
        this.currentPDF = null;
      }
      this.ctx.clearRect(0, 0, this.pdfCanvas.width, this.pdfCanvas.height);
      this.showLoading(false);
    });
  }
  
  /**
   * Load and display a PDF file
   * @param {string} url - URL to the PDF file
   * @param {Object} metadata - Document metadata
   */
  async loadPDF(url, metadata = {}) {
    this.showLoading(true);
    this.currentUrl = url;
    
    try {
      // Load the PDF document using PDF.js
      const loadingTask = pdfjsLib.getDocument(url);
      this.currentPDF = await loadingTask.promise;
      
      // Set document metadata
      if (metadata.type) this.documentType.textContent = metadata.type;
      if (metadata.date) this.documentDate.textContent = metadata.date;
      
      // Set download link
      this.downloadPdf.href = url;
      this.downloadPdf.download = url.split('/').pop();
      
      // Update page count
      this.pageCount.textContent = this.currentPDF.numPages;
      
      // Display first page
      this.currentPage = 1;
      await this.renderPage(this.currentPage);
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.showError('Could not load PDF document. Please try again later.');
    }
  }
  
  /**
   * Render a specific page of the PDF
   * @param {number} pageNumber - Page number to render
   */
  async renderPage(pageNumber) {
    if (!this.currentPDF) return;
    
    try {
      const page = await this.currentPDF.getPage(pageNumber);
      
      // Calculate viewport to fit canvas
      const viewport = page.getViewport({ scale: this.scale });
      
      // Set canvas dimensions to match the viewport
      this.pdfCanvas.width = viewport.width;
      this.pdfCanvas.height = viewport.height;
      
      // Render the page
      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Update current page indicator
      this.pageNum.textContent = pageNumber;
      
      // Disable/enable prev/next buttons as needed
      this.prevButton.disabled = pageNumber <= 1;
      this.nextButton.disabled = pageNumber >= this.currentPDF.numPages;
    } catch (error) {
      console.error('Error rendering page:', error);
      this.showError('Error displaying page. Please try again.');
    }
  }
  
  /**
   * Go to the previous page
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderPage(this.currentPage);
    }
  }
  
  /**
   * Go to the next page
   */
  nextPage() {
    if (this.currentPDF && this.currentPage < this.currentPDF.numPages) {
      this.currentPage++;
      this.renderPage(this.currentPage);
    }
  }
  
  /**
   * Zoom in or out
   * @param {number} delta - Change in zoom scale
   */
  zoom(delta) {
    // Limit zoom range between 0.5 and 2.5
    const newScale = Math.max(0.5, Math.min(2.5, this.scale + delta));
    
    if (newScale !== this.scale) {
      this.scale = newScale;
      this.zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
      this.renderPage(this.currentPage);
    }
  }
  
  /**
   * Show or hide loading indicator
   * @param {boolean} show - Whether to show loading
   */
  showLoading(show) {
    if (this.loadingDiv) {
      this.loadingDiv.style.display = show ? 'flex' : 'none';
    }
  }
  
  /**
   * Show error message in the viewer
   * @param {string} message - Error message
   */
  showError(message) {
    this.showLoading(false);
    
    // Create error message element if it doesn't exist
    let errorDiv = document.querySelector('#pdfViewerContainer .error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      document.getElementById('pdfViewerContainer').appendChild(errorDiv);
    }
    
    // Display error message
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
  
  /**
   * Open the PDF viewer modal with the specified document
   * @param {string} url - URL to the PDF file
   * @param {Object} metadata - Document metadata
   */
  openViewer(url, metadata = {}) {
    this.pdfViewerModal.modal('show');
    this.loadPDF(url, metadata);
  }
}

// Initialize the PDF viewer when the document is ready
$(document).ready(() => {
  // Check if PDF.js is available
  if (typeof pdfjsLib === 'undefined') {
    console.error('PDF.js library not loaded. Please include it in your project.');
    return;
  }
  
  // Set worker path for PDF.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
  
  // Initialize the PDF viewer
  window.pdfViewer = new PdfViewer();
  
  // Example of how to trigger PDF viewing from other parts of the application
  // document.addEventListener('view-pdf', (event) => {
  //   const { url, metadata } = event.detail;
  //   window.pdfViewer.openViewer(url, metadata);
  // });
}); 