/**
 * Document Upload Fix Script
 * This script fixes the document upload functionality in the Library of Kemet section.
 */

// Set API base URL
window.API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document uploader fix script loaded');
  
  // Initialize tables safely in a try-catch block
  try {
    // Initialize any global variables that might be used by other scripts
    if (typeof tables === 'undefined') {
      window.tables = {};
    }
  } catch (e) {
    console.error('Error initializing tables:', e);
  }
  
  // Remove the problematic Storage initialization code if it exists
  try {
    // This will run after the main script has executed
    setTimeout(() => {
      if (window.storage) {
        console.log('Removing problematic Storage initialization');
        window.storage = null;
      }
    }, 100);
  } catch (e) {
    console.error('Error cleaning up Storage:', e);
  }
  
  // Get reference to the upload form
  const uploadForm = document.getElementById('documentUploadForm');
  
  if (!uploadForm) {
    console.error('Document upload form not found');
    return;
  }
  
  // Check for and remove any existing event listeners
  const newUploadForm = uploadForm.cloneNode(true);
  uploadForm.parentNode.replaceChild(newUploadForm, uploadForm);
  
  // Add our event listener
  newUploadForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('Form submit event captured');
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading...';
    }
    
    try {
      // Create form data from the form
      const formData = new FormData(event.target);
      
      // Validate file
      const file = formData.get('file');
      if (!file || file.size === 0) {
        throw new Error('Please select a PDF file to upload');
      }
      
      // Check if it's a PDF
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }
      
      console.log('Uploading document to server...');
      console.log('File:', file.name, file.size, file.type);
      
      // Get the API base URL
      const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000';
      
      // Upload directly to our server API endpoint
      const response = await fetch(`${API_BASE_URL}/api/documents`, {
        method: 'POST',
        body: formData // Send form data directly
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }
      
      const result = await response.json();
      console.log('Upload success:', result);
      
      // Close the modal
      document.getElementById('documentUploadModal').style.display = 'none';
      
      // Show success message (using the existing function if available)
      if (typeof showSuccess === 'function') {
        showSuccess('Document uploaded successfully');
      } else {
        alert('Document uploaded successfully');
      }
      
      // Reload documents (using the existing function if available)
      if (typeof loadDocuments === 'function') {
        await loadDocuments();
      } else {
        // Reload our documents
        await loadDocumentsInUI();
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show error message (using the existing function if available)
      if (typeof showError === 'function') {
        showError('Error uploading document: ' + error.message);
      } else {
        alert('Error uploading document: ' + error.message);
      }
    } finally {
      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload';
      }
    }
  });
  
  console.log('Upload event listener attached to form');
  
  // Add event listener for document search
  const documentSearch = document.getElementById('documentSearch');
  if (documentSearch) {
    documentSearch.addEventListener('input', debounce(() => {
      const searchTerm = documentSearch.value;
      const filterType = document.getElementById('documentFilter')?.value || 'all';
      filterDocumentsInUI(searchTerm, filterType);
    }, 300));
  }
  
  // Add event listener for document filter
  const documentFilter = document.getElementById('documentFilter');
  if (documentFilter) {
    documentFilter.addEventListener('change', () => {
      const searchTerm = document.getElementById('documentSearch')?.value || '';
      const filterType = documentFilter.value;
      filterDocumentsInUI(searchTerm, filterType);
    });
  }
  
  // Expose the viewDocument function globally
  window.viewDocument = viewDocument;
  
  // Load documents initially
  loadDocumentsInUI();
});

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to load documents into the UI
async function loadDocumentsInUI() {
  try {
    console.log('Loading documents for display...');
    
    // Get the API base URL
    const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000';
    
    // Fetch documents from the server
    const response = await fetch(`${API_BASE_URL}/api/documents`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    
    const documents = await response.json();
    console.log('Documents loaded:', documents);
    
    // Store documents globally
    window.libraryDocuments = documents;
    
    // Display the documents in the UI
    displayDocumentsInUI(documents);
  } catch (error) {
    console.error('Error loading documents:', error);
  }
}

// Function to filter documents in the UI
function filterDocumentsInUI(searchTerm, filterType) {
  if (!window.libraryDocuments) {
    return;
  }
  
  const filteredDocuments = window.libraryDocuments.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesFilter;
  });
  
  displayDocumentsInUI(filteredDocuments);
}

// Function to display documents in the UI
function displayDocumentsInUI(documents) {
  const container = document.getElementById('documentsContainer');
  
  if (!container) {
    console.error('Documents container not found');
    return;
  }
  
  // Clear the container
  container.innerHTML = '';
  
  if (!documents || documents.length === 0) {
    container.innerHTML = '<div class="no-documents">No documents found. Upload a document to get started.</div>';
    return;
  }
  
  // Create a document card for each document
  documents.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    const thumbnail = doc.thumbnailUrl || 'images/default-doc.png';
    const fileUrl = doc.fileUrl || doc.url || '#';
    
    card.innerHTML = `
      <img src="${thumbnail}" alt="${doc.title}" class="document-thumbnail">
      <div class="document-info">
        <h3>${doc.title}</h3>
        <div class="document-meta">
          <span>${doc.type}</span>
          <span>${new Date(doc.uploadDate).toLocaleDateString()}</span>
        </div>
        <div class="document-description">${doc.description}</div>
      </div>
    `;
    
    // Make the entire card clickable
    card.addEventListener('click', () => {
      viewDocument(doc.id);
    });
    
    container.appendChild(card);
  });
  
  console.log(`Displayed ${documents.length} documents in the UI`);
}

// Function to view a document
async function viewDocument(id) {
  try {
    console.log('Viewing document with ID:', id);
    
    // Find the document in our array
    let doc = window.libraryDocuments ? window.libraryDocuments.find(d => d.id === id) : null;
    
    if (!doc) {
      // If not found in cache, fetch it from the API
      const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/documents/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      doc = await response.json();
    }
    
    // Show the document view modal
    const modal = document.getElementById('documentViewModal');
    if (!modal) {
      throw new Error('Document view modal not found');
    }
    
    // Set document metadata
    document.getElementById('viewDocumentTitle').textContent = doc.title;
    document.getElementById('viewDocumentType').textContent = doc.type;
    document.getElementById('viewDocumentDate').textContent = new Date(doc.uploadDate).toLocaleDateString();
    
    // Get the file URL - handle cloud storage URLs properly
    let fileUrl = doc.fileUrl || doc.url;
    
    // Check if the URL is a cloud storage URL (starts with gs://)
    if (fileUrl && fileUrl.startsWith('gs://')) {
      // Convert GCS URL to HTTP URL
      const bucketName = fileUrl.split('/')[2];
      const objectPath = fileUrl.split('/').slice(3).join('/');
      fileUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
    } 
    // If URL is a relative path, make it absolute
    else if (fileUrl && fileUrl.startsWith('/')) {
      fileUrl = window.location.origin + fileUrl;
    }
    // If URL is absolute but using http when we're on https, update it
    else if (fileUrl && fileUrl.startsWith('http:') && window.location.protocol === 'https:') {
      fileUrl = fileUrl.replace('http:', 'https:');
    }
    
    if (!fileUrl) {
      throw new Error('Document URL not available');
    }
    
    console.log('Loading document from URL:', fileUrl);
    
    // Update document view modal to match the screenshot
    modal.querySelector('.modal-content').classList.add('document-viewer-layout');
    
    // Load the document in the PDF viewer
    if (window.SimplePDFViewer && typeof window.SimplePDFViewer.loadPDF === 'function') {
      // Use our simple PDF viewer
      window.SimplePDFViewer.loadPDF(fileUrl);
    } else {
      // Fallback to basic loading if integrated viewer not available
      loadPdfWithPdfjsLib(fileUrl);
    }
    
    // Display the modal
    modal.style.display = 'block';
  } catch (error) {
    console.error('Error viewing document:', error);
    alert('Error viewing document: ' + error.message);
  }
}

// Function to load PDF with PDF.js library
function loadPdfWithPdfjsLib(url) {
  // Use our new SimplePDFViewer if available
  if (window.SimplePDFViewer && typeof window.SimplePDFViewer.loadPDF === 'function') {
    window.SimplePDFViewer.loadPDF(url);
    return;
  }
  
  // Get necessary elements
  const canvas = document.getElementById('pdfViewer');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const pageNumElement = document.getElementById('pageNum');
  const pageCountElement = document.getElementById('pageCount');
  const extractedTextElement = document.getElementById('extractedText');
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');
  const zoomInButton = document.getElementById('zoomIn');
  const zoomOutButton = document.getElementById('zoomOut');
  const downloadButton = document.getElementById('downloadPdf');
  
  if (!canvas || !ctx) {
    console.error('PDF canvas or context not found');
    return;
  }
  
  // Show loading indicator
  const container = document.querySelector('.pdf-viewer');
  if (container) {
    container.classList.add('loading');
  }
  
  // State variables
  let pdfDoc = null;
  let pageNum = 1;
  let zoom = 1.5;
  
  // Ensure PDF.js is loaded
  ensurePDFJS().then(() => {
    // Load the PDF
    window.pdfjsLib.getDocument(url).promise.then(function(pdf) {
      pdfDoc = pdf;
      
      // Update page count
      if (pageCountElement) {
        pageCountElement.textContent = pdf.numPages;
      }
      
      // Set download link
      if (downloadButton) {
        downloadButton.href = url;
        downloadButton.download = url.split('/').pop();
      }
      
      // Render first page
      renderPage(1);
      
      // Set up event listeners
      if (prevButton) {
        prevButton.onclick = () => {
          if (pageNum <= 1) return;
          pageNum--;
          renderPage(pageNum);
        };
      }
      
      if (nextButton) {
        nextButton.onclick = () => {
          if (pageNum >= pdf.numPages) return;
          pageNum++;
          renderPage(pageNum);
        };
      }
      
      if (zoomInButton) {
        zoomInButton.onclick = () => {
          zoom += 0.25;
          renderPage(pageNum);
        };
      }
      
      if (zoomOutButton) {
        zoomOutButton.onclick = () => {
          if (zoom <= 0.5) return;
          zoom -= 0.25;
          renderPage(pageNum);
        };
      }
      
      // Remove loading indicator
      if (container) {
        container.classList.remove('loading');
      }
    }).catch(function(error) {
      console.error('Error loading PDF:', error);
      if (container) {
        container.classList.remove('loading');
      }
      alert('Error loading PDF: ' + error.message);
    });
  }).catch(error => {
    console.error('Error loading PDF.js:', error);
    alert('Error loading PDF viewer library.');
  });
  
  // Function to render a page
  function renderPage(num) {
    if (!pdfDoc) return;
    
    pageNum = num;
    
    // Update page number display
    if (pageNumElement) {
      pageNumElement.textContent = num;
    }
    
    // Get the page
    pdfDoc.getPage(num).then(function(page) {
      // Calculate viewport
      const viewport = page.getViewport({ scale: zoom });
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the page
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      page.render(renderContext).promise.then(() => {
        // Extract and display text content
        if (extractedTextElement) {
          page.getTextContent().then(function(textContent) {
            const textItems = textContent.items;
            let text = '';
            
            textItems.forEach(function(item) {
              text += item.str + ' ';
            });
            
            extractedTextElement.textContent = text;
          });
        }
      });
    });
  }
  
  // Function to ensure PDF.js is loaded
  function ensurePDFJS() {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js';
      script.onload = function() {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Functions to show and close document upload modal
function openDocumentUpload() {
  const modal = document.getElementById('documentUploadModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeDocumentUpload() {
  const modal = document.getElementById('documentUploadModal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('documentUploadForm').reset();
  }
} 