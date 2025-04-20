class ReportManager {
  constructor() {
    this.API_BASE_URL = '/api';
    this.editingReportId = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Search and filter
    document.getElementById('reportSearch')?.addEventListener('input', 
      this.debounce(() => this.loadReports(), 300)
    );
    document.getElementById('reportFilter')?.addEventListener('change', 
      () => this.loadReports()
    );
    
    // Form submission
    document.getElementById('reportForm')?.addEventListener('submit', 
      (e) => this.handleReportSubmit(e)
    );
  }

  async loadReports() {
    try {
      const searchTerm = document.getElementById('reportSearch')?.value || '';
      const filterType = document.getElementById('reportFilter')?.value || 'all';
      
      const response = await fetch(`${this.API_BASE_URL}/reports?type=${filterType}&search=${searchTerm}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const reports = await response.json();
      this.displayReports(reports);
    } catch (error) {
      this.showError('Error loading reports: ' + error.message);
    }
  }

  displayReports(reports) {
    const container = document.getElementById('reportsContainer');
    if (!container) return;

    if (!reports || reports.length === 0) {
      container.innerHTML = '<div class="no-reports">No reports available</div>';
      return;
    }

    const reportCards = reports.map(report => `
      <div class="report-card" data-type="${report.type}">
        <h3>${this.escapeHtml(report.title)}</h3>
        <div class="report-meta">
          <div>By ${this.escapeHtml(report.author)}</div>
          <div>${new Date(report.date).toLocaleDateString()}</div>
        </div>
        <div class="report-summary">${this.escapeHtml(report.summary)}</div>
        <div class="report-actions">
          <button onclick="reportManager.viewReport(${report.id})" class="button">View</button>
          <button onclick="reportManager.editReport(${report.id})" class="button">Edit</button>
          <button onclick="reportManager.deleteReport(${report.id})" class="button secondary">Delete</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = reportCards;
  }

  async viewReport(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/reports/${id}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      
      const report = await response.json();
      const modal = document.getElementById('reportModal');
      if (!modal) return;

      modal.innerHTML = `
        <div class="modal-content report-detail">
          <div class="header">
            <div class="title">${this.escapeHtml(report.title)}</div>
            <div class="meta">
              <div class="meta-item">
                <div class="meta-label">Author</div>
                <div>${this.escapeHtml(report.author)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Date</div>
                <div>${new Date(report.date).toLocaleDateString()}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Type</div>
                <div>${this.escapeHtml(report.type)}</div>
              </div>
            </div>
            <div class="summary">${this.escapeHtml(report.summary)}</div>
          </div>
          <div class="content-wrapper">
            <div class="content">${report.content}</div>
          </div>
          <div class="report-actions">
            <button onclick="reportManager.exportToPDF()" class="button">
              <i class="fas fa-file-pdf"></i> Export PDF
            </button>
            <button onclick="window.print()" class="button">
              <i class="fas fa-print"></i> Print
            </button>
            <button onclick="reportManager.closeModal()" class="button secondary">
              <i class="fas fa-times"></i> Close
            </button>
          </div>
        </div>
      `;
      
      modal.style.display = 'block';
    } catch (error) {
      this.showError('Error loading report: ' + error.message);
    }
  }

  async editReport(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/reports/${id}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      
      const report = await response.json();
      this.openReportForm(report);
    } catch (error) {
      this.showError('Error loading report: ' + error.message);
    }
  }

  async deleteReport(id) {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/reports/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete report');
      
      await this.loadReports();
      this.showSuccess('Report deleted successfully');
    } catch (error) {
      this.showError('Error deleting report: ' + error.message);
    }
  }

  openReportForm(reportData = null) {
    const modal = document.getElementById('reportModal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-content">
        <h2>${reportData ? 'Edit Report' : 'Create New Report'}</h2>
        <form id="reportForm" class="report-form">
          <div class="form-group">
            <label for="reportTitle">Title</label>
            <input type="text" id="reportTitle" name="title" required>
          </div>
          <div class="form-group">
            <label for="reportType">Type</label>
            <select id="reportType" name="type" required>
              <option value="farm">Farm Report</option>
              <option value="resource">Resource Report</option>
              <option value="community">Community Report</option>
            </select>
          </div>
          <div class="form-group">
            <label for="reportAuthor">Author</label>
            <input type="text" id="reportAuthor" name="author" required>
          </div>
          <div class="form-group">
            <label for="reportSummary">Summary</label>
            <textarea id="reportSummary" name="summary" required></textarea>
          </div>
          <div class="form-group">
            <label for="reportContent">Content</label>
            <textarea id="reportContent" name="content" required></textarea>
          </div>
          <div class="modal-buttons">
            <button type="submit" class="button">Save Report</button>
            <button type="button" onclick="reportManager.closeModal()" class="button secondary">Cancel</button>
          </div>
        </form>
      </div>
    `;

    if (reportData) {
      this.editingReportId = reportData.id;
      document.getElementById('reportTitle').value = reportData.title;
      document.getElementById('reportType').value = reportData.type;
      document.getElementById('reportAuthor').value = reportData.author;
      document.getElementById('reportSummary').value = reportData.summary;
      document.getElementById('reportContent').value = reportData.content;
    } else {
      this.editingReportId = null;
    }

    modal.style.display = 'block';
    document.getElementById('reportForm').addEventListener('submit', (e) => this.handleReportSubmit(e));
  }

  async handleReportSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const reportData = Object.fromEntries(formData);
    
    try {
      const url = this.editingReportId 
        ? `${this.API_BASE_URL}/reports/${this.editingReportId}`
        : `${this.API_BASE_URL}/reports`;
        
      const response = await fetch(url, {
        method: this.editingReportId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) throw new Error('Failed to save report');
      
      await this.loadReports();
      this.closeModal();
      this.showSuccess('Report saved successfully');
    } catch (error) {
      this.showError('Error saving report: ' + error.message);
    }
  }

  async exportToPDF() {
    const element = document.querySelector('.report-detail');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: 'report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      this.showSuccess('PDF exported successfully');
    } catch (error) {
      this.showError('Error exporting PDF: ' + error.message);
    }
  }

  closeModal() {
    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
      reportModal.style.display = 'none';
    }
    this.editingReportId = null;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    this.showNotification(errorDiv);
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    this.showNotification(successDiv);
  }

  showNotification(element) {
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

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  debounce(func, wait) {
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
}

// Initialize the report manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.reportManager = new ReportManager();
  window.reportManager.loadReports();
}); 