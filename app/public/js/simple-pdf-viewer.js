/**
 * Simple PDF Viewer
 * A standalone PDF viewer that doesn't depend on other JavaScript libraries
 */

// Set PDF.js worker
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

class SimplePDFViewer {
  constructor() {
    // Initialize properties
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1.5;
    this.canvas = document.getElementById('pdfViewer');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { willReadFrequently: true }) : null;
    this.extractedTextElement = document.getElementById('extractedText');
    this.loadingElement = document.querySelector('.pdf-loading');
    this.errorElement = document.querySelector('.pdf-error');
    this.pdfUrl = null;

    // Hide error initially
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
    
    // Bind event listeners
    this.bindEventListeners();
  }

  bindEventListeners() {
    // Navigation buttons
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const zoomInButton = document.getElementById('zoomIn');
    const zoomOutButton = document.getElementById('zoomOut');
    const copyTextButton = document.getElementById('copyText');
    const printButton = document.getElementById('printDocument');
    const downloadButton = document.getElementById('downloadPdf');

    if (prevButton) prevButton.addEventListener('click', () => this.onPrevPage());
    if (nextButton) nextButton.addEventListener('click', () => this.onNextPage());
    if (zoomInButton) zoomInButton.addEventListener('click', () => this.onZoomIn());
    if (zoomOutButton) zoomOutButton.addEventListener('click', () => this.onZoomOut());
    if (copyTextButton) copyTextButton.addEventListener('click', () => this.onCopyText());
    if (printButton) printButton.addEventListener('click', () => this.onPrint());
    if (downloadButton) downloadButton.addEventListener('click', () => this.onDownload());
  }

  async loadPDF(url) {
    if (!url) {
      this.showError('No PDF URL provided');
      return;
    }

    try {
      this.showLoading();
      this.hideError();
      
      console.log('Loading PDF from URL:', url);
      
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(url);
      this.pdfDoc = await loadingTask.promise;
      
      console.log('PDF loaded successfully');
      
      // Update page count
      const pageCountElement = document.getElementById('pageCount');
      const pageNumElement = document.getElementById('pageNum');
      
      if (pageCountElement) pageCountElement.textContent = this.pdfDoc.numPages;
      if (pageNumElement) pageNumElement.textContent = this.pageNum;
      
      // Store URL for download
      this.pdfUrl = url;
      
      // Render first page
      await this.renderPage(this.pageNum);
      
      this.hideLoading();
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.showError('Failed to load PDF document');
      this.hideLoading();
    }
  }

  async renderPage(num) {
    if (!this.pdfDoc) {
      console.error('No PDF document loaded');
      return;
    }

    this.pageRendering = true;
    
    try {
      console.log('Rendering page', num);
      
      // Get the page
      const page = await this.pdfDoc.getPage(num);
      
      // Calculate viewport
      const viewport = page.getViewport({ scale: this.scale });
      
      // Set canvas dimensions
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;
      
      // Render the page
      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Extract and display text content
      if (this.extractedTextElement) {
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        let text = '';
        textItems.forEach(item => {
          text += item.str + ' ';
        });
        this.extractedTextElement.textContent = text;
      }
      
      // Update page number display
      const pageNumElement = document.getElementById('pageNum');
      if (pageNumElement) pageNumElement.textContent = num;
      
      this.pageRendering = false;
      
      if (this.pageNumPending !== null) {
        this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }

      console.log('Page rendered successfully');
    } catch (error) {
      console.error('Error rendering page:', error);
      this.showError('Failed to render page');
      this.pageRendering = false;
    }
  }

  queueRenderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  onPrevPage() {
    if (this.pageNum <= 1) return;
    this.pageNum--;
    this.queueRenderPage(this.pageNum);
  }

  onNextPage() {
    if (!this.pdfDoc || this.pageNum >= this.pdfDoc.numPages) return;
    this.pageNum++;
    this.queueRenderPage(this.pageNum);
  }

  onZoomIn() {
    this.scale = Math.min(3.0, this.scale * 1.2);
    this.queueRenderPage(this.pageNum);
  }

  onZoomOut() {
    this.scale = Math.max(0.5, this.scale / 1.2);
    this.queueRenderPage(this.pageNum);
  }

  onCopyText() {
    if (this.extractedTextElement) {
      navigator.clipboard.writeText(this.extractedTextElement.textContent)
        .then(() => this.showSuccess('Text copied to clipboard'))
        .catch(err => this.showError('Failed to copy text'));
    }
  }

  onPrint() {
    window.print();
  }

  async onDownload() {
    if (!this.pdfUrl) {
      this.showError('No PDF document loaded');
      return;
    }

    try {
      const response = await fetch(this.pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.pdfUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      this.showError('Failed to download PDF');
    }
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

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  }
}

// Initialize PDF viewer when the DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing PDF viewer...');
  window.pdfViewer = new SimplePDFViewer();
});

// Function to load PDF when a document is clicked
function openPDFViewer(url) {
  if (!url) {
    console.error('No URL provided to openPDFViewer');
    return;
  }

  const modal = document.getElementById('documentViewModal');
  if (modal) {
    modal.style.display = 'block';
  }
  
  if (window.pdfViewer) {
    window.pdfViewer.loadPDF(url);
  } else {
    console.error('PDF viewer not initialized');
  }
} 