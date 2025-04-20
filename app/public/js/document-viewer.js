class DocumentViewer {
    constructor(containerId = 'pdfViewer') {
        this.container = document.getElementById(containerId);
        this.currentPdf = null;
        this.currentPage = 1;
        this.zoom = 1.0;
        this.pdfUrl = null;
        
        // Initialize PDF.js worker if not already set
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        } else {
            console.error('PDF.js library not loaded');
        }
        
        this.initializeControls();
    }

    initializeControls() {
        // Add zoom controls
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.setZoom(this.zoom + 0.2));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.setZoom(this.zoom - 0.2));

        // Add page navigation controls
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());
        
        // Add download button event listener
        const downloadBtn = document.getElementById('downloadPdf');
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadPdf());
        
        // Add copy text button event listener
        const copyTextBtn = document.getElementById('copyText');
        if (copyTextBtn) copyTextBtn.addEventListener('click', () => this.copyText());
        
        // Add print button event listener
        const printBtn = document.getElementById('printDocument');
        if (printBtn) printBtn.addEventListener('click', () => this.printDocument());
    }

    async loadDocument(url) {
        try {
            if (!url) {
                console.error('No URL provided');
                this.showError('No PDF URL provided');
                return false;
            }
            
            this.pdfUrl = url;
            this.showLoading(true);
            
            // Check if pdfjsLib is available
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js library not loaded');
            }
            
            // Load the PDF document
            const loadingTask = pdfjsLib.getDocument(url);
            this.currentPdf = await loadingTask.promise;
            
            // Update page count display
            const pageCount = document.getElementById('pageCount');
            if (pageCount) {
                pageCount.textContent = this.currentPdf.numPages;
            }
            
            // Update page number display
            const pageNum = document.getElementById('pageNum');
            if (pageNum) {
                pageNum.textContent = '1';
            }
            
            // Reset to first page
            this.currentPage = 1;
            await this.renderCurrentPage();
            
            this.showLoading(false);
            return true;
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError('Error loading PDF: ' + error.message);
            this.showLoading(false);
            return false;
        }
    }

    async renderCurrentPage() {
        if (!this.currentPdf) {
            console.error('No PDF loaded');
            return;
        }

        try {
            this.showLoading(true);
            
            const page = await this.currentPdf.getPage(this.currentPage);
            const viewport = page.getViewport({ scale: this.zoom });

            // Prepare canvas for rendering
            if (!this.container) {
                console.error('PDF viewer container not found');
                return;
            }
            
            let canvas = this.container.querySelector('canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                this.container.innerHTML = '';
                this.container.appendChild(canvas);
            }
            
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render the page
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext);

            // Update current page display
            const pageNum = document.getElementById('pageNum');
            if (pageNum) {
                pageNum.textContent = this.currentPage;
            }
            
            // Extract text for the text panel
            this.extractTextFromPage(page);
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error rendering page:', error);
            this.showError('Error rendering page: ' + error.message);
            this.showLoading(false);
        }
    }
    
    async extractTextFromPage(page) {
        try {
            const textContent = await page.getTextContent();
            const textItems = textContent.items;
            let lastY;
            let text = '';
            
            for (let i = 0; i < textItems.length; i++) {
                const item = textItems[i];
                if (lastY == item.transform[5] || !lastY) {
                    text += item.str;
                } else {
                    text += '\n' + item.str;
                }
                lastY = item.transform[5];
            }
            
            const extractedTextDiv = document.getElementById('extractedText');
            if (extractedTextDiv) {
                extractedTextDiv.textContent = text;
            }
        } catch (error) {
            console.error('Error extracting text:', error);
        }
    }

    async nextPage() {
        if (this.currentPdf && this.currentPage < this.currentPdf.numPages) {
            this.currentPage++;
            await this.renderCurrentPage();
        }
    }

    async previousPage() {
        if (this.currentPdf && this.currentPage > 1) {
            this.currentPage--;
            await this.renderCurrentPage();
        }
    }

    setZoom(newZoom) {
        if (newZoom >= 0.5 && newZoom <= 3.0) {
            this.zoom = newZoom;
            this.renderCurrentPage();
        }
    }
    
    downloadPdf() {
        if (this.pdfUrl) {
            const a = document.createElement('a');
            a.href = this.pdfUrl;
            a.download = 'document.pdf';
            a.target = '_blank';
            a.click();
        } else {
            this.showError('No PDF loaded to download');
        }
    }
    
    copyText() {
        const extractedTextDiv = document.getElementById('extractedText');
        if (extractedTextDiv && extractedTextDiv.textContent) {
            navigator.clipboard.writeText(extractedTextDiv.textContent)
                .then(() => this.showSuccess('Text copied to clipboard'))
                .catch(err => this.showError('Failed to copy text: ' + err));
        } else {
            this.showError('No text to copy');
        }
    }
    
    printDocument() {
        if (this.currentPdf) {
            window.print();
        } else {
            this.showError('No document loaded to print');
        }
    }
    
    showLoading(isLoading) {
        const viewer = this.container.closest('.document-viewer');
        if (viewer) {
            if (isLoading) {
                viewer.classList.add('loading');
            } else {
                viewer.classList.remove('loading');
            }
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Find a good place to show the error
        const container = this.container.closest('.document-viewer');
        if (container) {
            container.appendChild(errorDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        } else {
            console.error(message);
        }
    }
    
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        // Find a good place to show the success message
        const container = this.container.closest('.document-viewer');
        if (container) {
            container.appendChild(successDiv);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        } else {
            console.log(message);
        }
    }
}

// Initialize the document viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const pdfViewer = new DocumentViewer('pdfViewer');
    window.documentViewer = pdfViewer;
    
    // Test with a sample PDF if available
    const samplePdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
    
    // Add load sample button if it exists
    const loadSampleBtn = document.getElementById('loadSamplePdf');
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', () => {
            pdfViewer.loadDocument(samplePdfUrl);
        });
    }
}); 