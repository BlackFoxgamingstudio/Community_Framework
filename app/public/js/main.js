// Toggle mobile navigation
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu').querySelector('ul');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

// Global variables
let currentSection = null;
let currentOperation = null;
let tables = {};
let charts = {};

// Initialize when document is ready
$(document).ready(function() {
    initializeTables();
    initializeCharts();
    setupEventListeners();
    loadInitialData();
});

// Initialize DataTables
function initializeTables() {
    const commonConfig = {
        responsive: true,
        dom: 'Bfrtip',
        select: true,
        buttons: [
            {
                text: 'Add New',
                action: function () {
                    openModal(this.table().context[0].sTableId, 'add');
                }
            },
            {
                text: 'Edit',
                extend: 'selected',
                action: function () {
                    const data = this.rows({ selected: true }).data()[0];
                    openModal(this.table().context[0].sTableId, 'edit', data);
                }
            },
            {
                text: 'Delete',
                extend: 'selected',
                action: function () {
                    if (confirm('Are you sure you want to delete this record?')) {
                        const data = this.rows({ selected: true }).data()[0];
                        deleteRecord(this.table().context[0].sTableId, data.id);
                    }
                }
            }
        ]
    };

    // Initialize Farm Data Table
    tables.farmData = $('#farmDataTable').DataTable({
        ...commonConfig,
        columns: [
            { data: 'id' },
            { data: 'cropType' },
            { data: 'yieldAmount' },
            { data: 'area' },
            { data: 'notes' },
            { data: 'dateAdded' }
        ]
    });

    // Initialize Resource Metrics Table
    tables.resourceMetrics = $('#resourceDataTable').DataTable({
        ...commonConfig,
        columns: [
            { data: 'id' },
            { data: 'metricType' },
            { data: 'value' },
            { data: 'unit' },
            { data: 'date' },
            { data: 'notes' }
        ]
    });

    // Initialize Community Impact Table
    tables.communityData = $('#communityDataTable').DataTable({
        ...commonConfig,
        columns: [
            { data: 'id' },
            { data: 'programType' },
            { data: 'participants' },
            { data: 'location' },
            { data: 'date' },
            { data: 'feedbackScore' },
            { data: 'notes' }
        ]
    });
}

// Initialize Charts
function initializeCharts() {
    // Farm Performance Chart
    const farmCtx = document.getElementById('farmPerformanceChart').getContext('2d');
    charts.farmPerformance = new Chart(farmCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Yield Amount',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    data: []
                },
                {
                    label: 'Area (sq ft)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Resource Efficiency Chart
    const resourceCtx = document.getElementById('resourceEfficiencyChart').getContext('2d');
    charts.resourceEfficiency = new Chart(resourceCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Community Engagement Chart
    const communityCtx = document.getElementById('communityEngagementChart').getContext('2d');
    charts.communityEngagement = new Chart(communityCtx, {
        type: 'bubble',
        data: {
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Modal events
    $('#crudModal').on('hidden.bs.modal', clearForm);
    $('#crudForm').on('submit', handleFormSubmit);
}

// Load initial data
async function loadInitialData() {
    await loadData('farmData');
    await loadData('resourceMetrics');
    await loadData('communityData');
}

// Load data for a specific section
async function loadData(section) {
    try {
        const response = await fetch(`/api/${section}`);
        if (!response.ok) throw new Error(`Failed to fetch ${section}`);
        
        const data = await response.json();
        tables[section].clear().rows.add(data).draw();
        updateCharts(section, data);
    } catch (error) {
        showError(`Error loading ${section}: ${error.message}`);
    }
}

// Save record (create or update)
async function saveRecord(section, data, id = null) {
    try {
        const url = id ? `/api/${section}/${id}` : `/api/${section}`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to save record');
        
        await loadData(section);
        closeModal();
        showSuccess('Record saved successfully');
    } catch (error) {
        showError('Error saving record: ' + error.message);
    }
}

// Delete record
async function deleteRecord(section, id) {
    try {
        const response = await fetch(`/api/${section}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete record');
        
        await loadData(section);
        showSuccess('Record deleted successfully');
    } catch (error) {
        showError('Error deleting record: ' + error.message);
    }
}

// Utility functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    showNotification(errorDiv);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    showNotification(successDiv);
}

function showNotification(element) {
    const container = document.getElementById('notification-container') || 
        (() => {
            const div = document.createElement('div');
            div.id = 'notification-container';
            div.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(div);
            return div;
        })();

    container.appendChild(element);
    setTimeout(() => {
        element.remove();
        if (!container.hasChildNodes()) {
            container.remove();
        }
    }, 5000);
}

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

// Modal functions
function openModal(section, operation, data = null) {
    currentSection = section;
    currentOperation = operation;
    
    const modal = document.getElementById('crudModal');
    const form = document.getElementById('crudForm');
    
    buildForm(section, form);
    if (data) {
        populateForm(form, data);
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('crudModal').style.display = 'none';
    clearForm();
}

function clearForm() {
    const form = document.getElementById('crudForm');
    form.reset();
    currentSection = null;
    currentOperation = null;
}

function buildForm(section, form) {
    const fields = getFormFields(section);
    form.innerHTML = fields.map(field => `
        <div class="form-group">
            <label for="${field.id}">${field.label}</label>
            ${field.type === 'select' 
                ? `<select id="${field.id}" name="${field.id}" required>
                    ${field.options.map(opt => 
                        `<option value="${opt.value}">${opt.label}</option>`
                    ).join('')}
                   </select>`
                : `<input type="${field.type}" id="${field.id}" name="${field.id}" 
                    ${field.required ? 'required' : ''} 
                    ${field.min ? `min="${field.min}"` : ''} 
                    ${field.max ? `max="${field.max}"` : ''}>
                `}
        </div>
    `).join('') + `
        <div class="modal-buttons">
            <button type="submit" class="button">Save</button>
            <button type="button" onclick="closeModal()" class="button secondary">Cancel</button>
        </div>
    `;
}

function getFormFields(section) {
    switch(section) {
        case 'farmData':
            return [
                { id: 'cropType', label: 'Crop Type', type: 'text', required: true },
                { id: 'yieldAmount', label: 'Yield Amount', type: 'number', required: true, min: 0 },
                { id: 'area', label: 'Area (sq ft)', type: 'number', required: true, min: 0 },
                { id: 'notes', label: 'Notes', type: 'text' },
                { id: 'dateAdded', label: 'Date', type: 'date', required: true }
            ];
        case 'resourceMetrics':
            return [
                { 
                    id: 'metricType', 
                    label: 'Metric Type', 
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'water', label: 'Water Usage' },
                        { value: 'energy', label: 'Energy Consumption' },
                        { value: 'soil', label: 'Soil Health' }
                    ]
                },
                { id: 'value', label: 'Value', type: 'number', required: true },
                { id: 'unit', label: 'Unit', type: 'text', required: true },
                { id: 'date', label: 'Date', type: 'date', required: true },
                { id: 'notes', label: 'Notes', type: 'text' }
            ];
        case 'communityData':
            return [
                { 
                    id: 'programType', 
                    label: 'Program Type', 
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'workshop', label: 'Workshop' },
                        { value: 'tour', label: 'Farm Tour' },
                        { value: 'volunteer', label: 'Volunteer Day' }
                    ]
                },
                { id: 'participants', label: 'Number of Participants', type: 'number', required: true, min: 0 },
                { id: 'location', label: 'Location', type: 'text', required: true },
                { id: 'date', label: 'Date', type: 'date', required: true },
                { id: 'feedbackScore', label: 'Feedback Score', type: 'number', required: true, min: 1, max: 5 },
                { id: 'notes', label: 'Notes', type: 'text' }
            ];
        default:
            return [];
    }
}

function populateForm(form, data) {
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = data[key];
        }
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    await saveRecord(currentSection, data, currentOperation === 'edit' ? data.id : null);
}

// Chart update functions
function updateCharts(section, data) {
    switch(section) {
        case 'farmData':
            updateFarmChart(data);
            break;
        case 'resourceMetrics':
            updateResourceChart(data);
            break;
        case 'communityData':
            updateCommunityChart(data);
            break;
    }
}

function updateFarmChart(data) {
    const sortedData = data.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
    
    charts.farmPerformance.data.labels = sortedData.map(d => d.dateAdded);
    charts.farmPerformance.data.datasets[0].data = sortedData.map(d => d.yieldAmount);
    charts.farmPerformance.data.datasets[1].data = sortedData.map(d => d.area);
    charts.farmPerformance.update();
}

function updateResourceChart(data) {
    const metricTypes = [...new Set(data.map(d => d.metricType))];
    
    charts.resourceEfficiency.data.labels = [...new Set(data.map(d => d.date))].sort();
    charts.resourceEfficiency.data.datasets = metricTypes.map((type, index) => {
        const typeData = data.filter(d => d.metricType === type);
        return {
            label: type.charAt(0).toUpperCase() + type.slice(1),
            data: typeData.map(d => d.value),
            borderColor: `hsl(${index * 360 / metricTypes.length}, 70%, 50%)`,
            fill: false
        };
    });
    
    charts.resourceEfficiency.update();
}

function updateCommunityChart(data) {
    charts.communityEngagement.data.datasets = [{
        label: 'Community Engagement',
        data: data.map(d => ({
            x: new Date(d.date),
            y: d.participants,
            r: d.feedbackScore * 4
        })),
        backgroundColor: data.map(d => 
            `hsla(${(d.feedbackScore - 1) * 30}, 70%, 50%, 0.6)`
        )
    }];
    
    charts.communityEngagement.update();
}

// PDF Viewer Implementation - Standalone Version
document.addEventListener('DOMContentLoaded', function() {
  initStandalonePDFViewer();
});

function initStandalonePDFViewer() {
  // Get references to PDF viewer elements
  const pdfViewer = document.getElementById('pdfViewer');
  if (!pdfViewer) return; // Exit if PDF viewer not found
  
  const ctx = pdfViewer.getContext('2d');
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');
  const zoomInButton = document.getElementById('zoomIn');
  const zoomOutButton = document.getElementById('zoomOut');
  const loadSampleButton = document.getElementById('loadSamplePdf');
  const copyTextButton = document.getElementById('copyText');
  const printButton = document.getElementById('printDocument');
  const downloadButton = document.getElementById('downloadPdf');
  const pageNumElement = document.getElementById('pageNum');
  const pageCountElement = document.getElementById('pageCount');
  const extractedTextElement = document.getElementById('extractedText');
  
  // PDF state variables
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 1.0;
  let currentPdfUrl = null;
  
  // Attach event listeners if elements exist
  if (prevButton) prevButton.addEventListener('click', onPrevPage);
  if (nextButton) nextButton.addEventListener('click', onNextPage);
  if (zoomInButton) zoomInButton.addEventListener('click', onZoomIn);
  if (zoomOutButton) zoomOutButton.addEventListener('click', onZoomOut);
  if (loadSampleButton) loadSampleButton.addEventListener('click', loadSamplePDF);
  if (copyTextButton) copyTextButton.addEventListener('click', copyExtractedText);
  if (printButton) printButton.addEventListener('click', printDocument);
  
  // Load PDF.js library
  function loadPDFLibrary() {
    return new Promise((resolve) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://mozilla.github.io/pdf.js/build/pdf.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
        resolve();
      };
      document.head.appendChild(script);
    });
  }
  
  // Render PDF page
  function renderPage(num) {
    if (!pdfDoc || !pdfViewer || !ctx) return;
    
    pageRendering = true;
    
    // Update UI
    if (pageNumElement) pageNumElement.textContent = num;
    
    // Get page
    pdfDoc.getPage(num).then(function(page) {
      const viewport = page.getViewport({ scale: scale });
      pdfViewer.height = viewport.height;
      pdfViewer.width = viewport.width;
      
      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      
      // Wait for rendering to finish
      renderTask.promise.then(function() {
        pageRendering = false;
        
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
        
        // Extract text content if element exists
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
  
  // Queue rendering (to avoid multiple renders at once)
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }
  
  // Navigation functions
  function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  }
  
  function onNextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  }
  
  // Zoom functions
  function onZoomIn() {
    scale += 0.25;
    queueRenderPage(pageNum);
  }
  
  function onZoomOut() {
    if (scale <= 0.5) return;
    scale -= 0.25;
    queueRenderPage(pageNum);
  }
  
  // Load a PDF document
  function loadPDF(url) {
    loadPDFLibrary().then(() => {
      const docViewer = document.querySelector('.document-viewer');
      if (docViewer) docViewer.classList.add('loading');
      
      // Reset state
      pageNum = 1;
      currentPdfUrl = url;
      
      // Load the PDF
      window.pdfjsLib.getDocument(url).promise.then(function(pdf) {
        pdfDoc = pdf;
        
        // Update UI
        if (pageCountElement) pageCountElement.textContent = pdf.numPages;
        if (docViewer) docViewer.classList.remove('loading');
        
        // Render first page
        renderPage(pageNum);
        
        // Set download link
        if (downloadButton) {
          downloadButton.href = url;
          downloadButton.download = url.split('/').pop();
        }
      }).catch(function(error) {
        console.error('Error loading PDF:', error);
        showErrorMessage('Failed to load PDF: ' + error.message);
        if (docViewer) docViewer.classList.remove('loading');
      });
    });
  }
  
  // Load a sample PDF
  function loadSamplePDF() {
    loadPDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf');
  }
  
  // Copy extracted text to clipboard
  function copyExtractedText() {
    if (!extractedTextElement) return;
    
    const text = extractedTextElement.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showSuccessMessage('Text copied to clipboard');
    }).catch(err => {
      showErrorMessage('Failed to copy text: ' + err);
    });
  }
  
  // Print the document
  function printDocument() {
    if (!pdfDoc) {
      showErrorMessage('No document loaded');
      return;
    }
    
    window.print();
  }
  
  // Show messages
  function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type + '-message';
    messageDiv.textContent = message;
    
    const docViewer = document.querySelector('.document-viewer');
    if (docViewer) {
      docViewer.appendChild(messageDiv);
      
      setTimeout(() => {
        messageDiv.remove();
      }, 3000);
    }
  }
  
  function showErrorMessage(message) {
    showMessage(message, 'error');
  }
  
  function showSuccessMessage(message) {
    showMessage(message, 'success');
  }
  
  // Auto-load sample PDF if requested
  if (loadSampleButton && loadSampleButton.dataset.autoload === 'true') {
    loadSamplePDF();
  }
}

// Function to open document in viewer
function openDocumentInViewer(documentUrl, title, type, date) {
  // Set modal title and metadata
  document.getElementById('viewDocumentTitle').textContent = title;
  document.getElementById('viewDocumentType').textContent = type;
  document.getElementById('viewDocumentDate').textContent = date;
  
  // Initialize PDF viewer
  const pdfContainer = document.getElementById('pdfViewerContainer');
  const viewer = new PDFViewer(pdfContainer);
  viewer.loadDocument(documentUrl);
  
  // Show modal
  document.getElementById('documentViewModal').style.display = 'block';
}

class PDFViewer {
  constructor() {
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1.0;
    this.canvas = document.getElementById('pdfViewer');
    this.ctx = this.canvas.getContext('2d');
    this.loadingOverlay = document.querySelector('.loading-overlay');

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById('prevPage').addEventListener('click', () => this.onPrevPage());
    document.getElementById('nextPage').addEventListener('click', () => this.onNextPage());
    document.getElementById('zoomIn').addEventListener('click', () => this.onZoomIn());
    document.getElementById('zoomOut').addEventListener('click', () => this.onZoomOut());
    document.getElementById('copyText').addEventListener('click', () => this.onCopyText());
    document.getElementById('printPDF').addEventListener('click', () => this.onPrintPDF());
    document.getElementById('downloadPDF').addEventListener('click', () => this.onDownloadPDF());
  }

  async loadDocument(url) {
    try {
      this.showLoading();
      const loadingTask = pdfjsLib.getDocument(url);
      this.pdfDoc = await loadingTask.promise;
      document.getElementById('pageCount').textContent = this.pdfDoc.numPages;
      this.renderPage(this.pageNum);
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.hideLoading();
      showErrorMessage('Failed to load PDF document');
    }
  }

  async renderPage(num) {
    this.pageRendering = true;
    this.showLoading();

    try {
      const page = await this.pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: this.scale });

      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;

      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      this.pageRendering = false;
      document.getElementById('pageNum').textContent = num;

      if (this.pageNumPending !== null) {
        this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      showErrorMessage('Failed to render PDF page');
    } finally {
      this.hideLoading();
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
    if (this.pageNum >= this.pdfDoc.numPages) return;
    this.pageNum++;
    this.queueRenderPage(this.pageNum);
  }

  onZoomIn() {
    if (this.scale >= 3.0) return;
    this.scale += 0.25;
    this.queueRenderPage(this.pageNum);
  }

  onZoomOut() {
    if (this.scale <= 0.25) return;
    this.scale -= 0.25;
    this.queueRenderPage(this.pageNum);
  }

  async onCopyText() {
    try {
      this.showLoading();
      const page = await this.pdfDoc.getPage(this.pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      
      const textContainer = document.createElement('div');
      textContainer.classList.add('extracted-text');
      textContainer.textContent = text;
      
      const viewerContainer = document.querySelector('.viewer-container');
      const existingText = viewerContainer.querySelector('.extracted-text');
      if (existingText) {
        viewerContainer.removeChild(existingText);
      }
      viewerContainer.appendChild(textContainer);
    } catch (error) {
      console.error('Error extracting text:', error);
      showErrorMessage('Failed to extract text from PDF');
    } finally {
      this.hideLoading();
    }
  }

  onPrintPDF() {
    if (!this.pdfDoc) return;
    window.print();
  }

  async onDownloadPDF() {
    if (!this.pdfDoc) return;
    try {
      const blob = await fetch(this.pdfDoc.url).then(res => res.blob());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showErrorMessage('Failed to download PDF');
    }
  }

  showLoading() {
    this.loadingOverlay.classList.add('active');
  }

  hideLoading() {
    this.loadingOverlay.classList.remove('active');
  }
}

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Create PDF viewer instance when modal is shown
let pdfViewer = null;
$('#pdfViewerModal').on('show.bs.modal', function(event) {
  const button = $(event.relatedTarget);
  const pdfUrl = button.data('pdf-url');
  
  if (!pdfViewer) {
    pdfViewer = new PDFViewer();
  }
  
  if (pdfUrl) {
    pdfViewer.loadDocument(pdfUrl);
  }
}); 