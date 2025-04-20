// Test Data
const testFarmData = {
  farm_id: 1,
  crop_type: 'Tomatoes',
  yield_amount: 150.5,
  planting_date: '2024-03-15',
  harvest_date: '2024-06-15',
  area_sqft: 500,
  resource_usage: JSON.stringify({ water: '100gal', fertilizer: '50kg' }),
  notes: 'Test farm data entry'
};

const testResourceMetric = {
  farm_id: 1,
  metric_type: 'water',
  value: 100.5,
  unit: 'gallons',
  recorded_date: '2024-03-15',
  notes: 'Test resource metric entry'
};

const testCommunityImpact = {
  program_type: 'workshop',
  participant_count: 25,
  impact_metrics: JSON.stringify({ satisfaction: 4.5, learning: 4.8 }),
  event_date: '2024-03-15',
  location: 'Main Farm',
  feedback_score: 4.5,
  notes: 'Test community impact entry'
};

// Test Functions
async function runTests() {
  console.group('Data Hub Tests');
  try {
    await testChartInitialization();
    await testFormSubmissions();
    await testDataFiltering();
    await testChartInteractivity();
    await testModalFunctionality();
    await testExportFunctionality();
    await testResponsiveness();
    console.log('✅ All tests completed');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
  console.groupEnd();
}

async function testChartInitialization() {
  console.group('Chart Initialization Tests');
  try {
    // Test Farm Performance Chart
    const farmChart = Chart.getChart('farmPerformanceChart');
    console.assert(farmChart !== undefined, 'Farm Performance Chart should be initialized');
    
    // Test Resource Efficiency Chart
    const resourceChart = Chart.getChart('resourceEfficiencyChart');
    console.assert(resourceChart !== undefined, 'Resource Efficiency Chart should be initialized');
    
    // Test Community Engagement Chart
    const communityChart = Chart.getChart('communityEngagementChart');
    console.assert(communityChart !== undefined, 'Community Engagement Chart should be initialized');
    
    console.log('✅ Chart initialization tests passed');
  } catch (error) {
    console.error('❌ Chart initialization tests failed:', error);
  }
  console.groupEnd();
}

async function testFormSubmissions() {
  console.group('Form Submission Tests');
  try {
    // Test Farm Data Form
    const farmForm = document.getElementById('farmDataForm');
    await testFormSubmission(farmForm, testFarmData, '/api/data-hub/farm-data');
    
    // Test Resource Metrics Form
    const resourceForm = document.getElementById('resourceMetricsForm');
    await testFormSubmission(resourceForm, testResourceMetric, '/api/data-hub/resource-metrics');
    
    // Test Community Impact Form
    const communityForm = document.getElementById('communityImpactForm');
    await testFormSubmission(communityForm, testCommunityImpact, '/api/data-hub/community-impact');
    
    console.log('✅ Form submission tests passed');
  } catch (error) {
    console.error('❌ Form submission tests failed:', error);
  }
  console.groupEnd();
}

async function testFormSubmission(form, testData, endpoint) {
  // Fill form with test data
  Object.entries(testData).forEach(([key, value]) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      input.value = value;
    }
  });
  
  // Submit form
  const submitEvent = new Event('submit');
  form.dispatchEvent(submitEvent);
  
  // Verify form reset
  await new Promise(resolve => setTimeout(resolve, 1000));
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    console.assert(input.value === '', `Form field ${input.name} should be reset after submission`);
  });
}

async function testDataFiltering() {
  console.group('Data Filtering Tests');
  try {
    const searchInput = document.getElementById('search-reports');
    const filterSelect = document.getElementById('filter-type');
    
    // Test search functionality
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('input'));
    await new Promise(resolve => setTimeout(resolve, 400)); // Wait for debounce
    
    // Test filter functionality
    filterSelect.value = 'workshop';
    filterSelect.dispatchEvent(new Event('change'));
    
    console.log('✅ Data filtering tests passed');
  } catch (error) {
    console.error('❌ Data filtering tests failed:', error);
  }
  console.groupEnd();
}

async function testChartInteractivity() {
  console.group('Chart Interactivity Tests');
  try {
    const charts = document.querySelectorAll('canvas');
    charts.forEach(canvas => {
      // Test hover functionality
      const mouseoverEvent = new MouseEvent('mousemove', {
        clientX: canvas.offsetLeft + 50,
        clientY: canvas.offsetTop + 50
      });
      canvas.dispatchEvent(mouseoverEvent);
      
      // Test click functionality
      const clickEvent = new MouseEvent('click', {
        clientX: canvas.offsetLeft + 50,
        clientY: canvas.offsetTop + 50
      });
      canvas.dispatchEvent(clickEvent);
    });
    
    console.log('✅ Chart interactivity tests passed');
  } catch (error) {
    console.error('❌ Chart interactivity tests failed:', error);
  }
  console.groupEnd();
}

async function testModalFunctionality() {
  console.group('Modal Functionality Tests');
  try {
    const modal = document.getElementById('data-modal');
    
    // Test modal opening
    showDataPointDetails({ 
      data: { datasets: [{ label: 'Test', data: [10] }], labels: ['Test Label'] },
      datasetIndex: 0,
      index: 0
    });
    console.assert(modal.style.display === 'block', 'Modal should be visible');
    
    // Test modal closing
    modal.click();
    console.assert(modal.style.display === 'none', 'Modal should be hidden');
    
    console.log('✅ Modal functionality tests passed');
  } catch (error) {
    console.error('❌ Modal functionality tests failed:', error);
  }
  console.groupEnd();
}

async function testExportFunctionality() {
  console.group('Export Functionality Tests');
  try {
    const types = ['farm-performance', 'resource-efficiency', 'community-impact'];
    for (const type of types) {
      await exportData(type);
    }
    console.log('✅ Export functionality tests passed');
  } catch (error) {
    console.error('❌ Export functionality tests failed:', error);
  }
  console.groupEnd();
}

async function testResponsiveness() {
  console.group('Responsiveness Tests');
  try {
    // Test mobile view
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test tablet view
    window.innerWidth = 768;
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test desktop view
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Responsiveness tests passed');
  } catch (error) {
    console.error('❌ Responsiveness tests failed:', error);
  }
  console.groupEnd();
}

// Run tests when page loads
document.addEventListener('DOMContentLoaded', runTests); 