document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addStatementBtn = document.getElementById('addStatementBtn');
    const addStatementModal = document.getElementById('addStatementModal');
    const statementForm = document.getElementById('statementForm');
    const statementTableBody = document.getElementById('statementTableBody');
    const exportStatementDataBtn = document.getElementById('exportStatementDataBtn');
    const searchInput = document.getElementById('searchInput');
    
    // Global variable to store all statements for filtering
    let allStatements = [];
    let incidentsChart = null; // Store chart instance for updates
    
    // Event Listeners
    if (addStatementBtn) {
        addStatementBtn.addEventListener('click', openAddStatementModal);
    }
    
    if (statementForm) {
        statementForm.addEventListener('submit', submitStatementForm);
        
        // Add auto-capitalization to text input fields
        const textInputs = statementForm.querySelectorAll('input[type="text"], textarea');
        textInputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.value.length === 1) {
                    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
                }
            });

            input.addEventListener('focus', function() {
                if (this.value.length > 0) {
                    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
                }
            });
        });
    }
    
    // Find and add event listener to all close/cancel buttons in the modal
    if (addStatementModal) {
        const closeButtons = addStatementModal.querySelectorAll('.cancel-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', closeAddStatementModal);
        });
    }
    
    if (exportStatementDataBtn) {
        exportStatementDataBtn.addEventListener('click', exportStatementData);
    }
    
    // Add search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterStatements(searchTerm);
        });
    }
    
    // Create file viewer modal if it doesn't exist
    createFileViewerModal();
    
    // FIXED: Load data first, then update charts
    initializeData();

    // Functions
    async function initializeData() {
        try {
            // First load all statements
            await loadStatements();
            
            // Then update charts and counts after data is loaded
            updateIncidentCount();
            
            // Load the chart with data
            await loadIncidentsChart();
            
            // Update chart subtitle
            updateChartSubtitle();
            
        } catch (error) {
            console.error('Error initializing data:', error);
        }
    }

    // FIXED: Make loadStatements return a promise and ensure data is loaded
    async function loadStatements() {
        try {
            showLoadingIndicator();
            
            const response = await fetch('/api/statements');
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const statements = await response.json();
            console.log('Loaded statements:', statements.length); // Debug log
            
            // Store statements globally for filtering
            allStatements = statements;
            
            // Render all statements initially
            renderStatements(statements);
            
            return statements; // Return the data
            
        } catch (error) {
            console.error('Error loading statements:', error);
            displayNotification('Failed to load statements. Please refresh the page.', 'error');
            allStatements = []; // Ensure allStatements is an array even on error
            throw error;
        } finally {
            hideLoadingIndicator();
        }
    }

    // FIXED: Enhanced chart loading with better error handling and data validation
    async function loadIncidentsChart() {
        try {
            const response = await fetch('/api/statements/chart-data/daily');
            
            if (response.ok) {
                const chartData = await response.json();
                console.log('API Chart data:', chartData); // Debug log
                createIncidentsChart(chartData.labels || [], chartData.data || []);
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error loading incidents chart from API:', error);
            console.log('Falling back to local data. allStatements length:', allStatements.length); // Debug log
            // Fallback to local data if API fails
            loadIncidentsChartFromLocalData();
        }
    }

    // FIXED: Improved local data processing with better debugging
    function loadIncidentsChartFromLocalData() {
        const incidentsCtx = document.getElementById('incidentsChart');
        if (!incidentsCtx) {
            console.error('Chart canvas element not found');
            return;
        }
        
        if (!allStatements || allStatements.length === 0) {
            console.warn('No statements data available for chart');
            createIncidentsChart([], []);
            return;
        }
        
        console.log('Processing', allStatements.length, 'statements for chart'); // Debug log
        
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Get number of days in current month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Initialize daily data for current month
        const dailyData = {};
        const labels = [];
        
        // Create labels for all days in current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${day}`;
            labels.push(dateStr);
            dailyData[dateStr] = 0;
        }
        
        // Count incidents by day for current month
let processedCount = 0;
allStatements.forEach(statement => {
    if (statement.dateOfIncident) {
        // Handle different date formats
        let date;
        if (statement.dateOfIncident.includes('T')) {
            // ISO format: 2024-01-15T00:00:00.000Z
            date = new Date(statement.dateOfIncident);
        } else if (statement.dateOfIncident.includes('-')) {
            // YYYY-MM-DD format
            date = new Date(statement.dateOfIncident + 'T00:00:00');
        } else {
            // Other formats
            date = new Date(statement.dateOfIncident);
        }
        
        console.log('Processing incident date:', statement.dateOfIncident, 'Parsed date:', date, 'Valid:', !isNaN(date.getTime())); // Debug log
        
        if (!isNaN(date.getTime()) && date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
            const day = date.getDate().toString();
            if (dailyData.hasOwnProperty(day)) {
                dailyData[day]++;
                processedCount++;
            }
        }
    }
});
        
        console.log('Processed', processedCount, 'incidents for current month'); // Debug log
        
        // Convert to array for chart
        const chartData = labels.map(day => dailyData[day]);
        console.log('Chart data array:', chartData); // Debug log
        console.log('Total incidents in chart:', chartData.reduce((a, b) => a + b, 0)); // Debug log
        
        createIncidentsChart(labels, chartData);
    }

    // FIXED: Separated chart creation logic for reusability
    function createIncidentsChart(labels, data) {
        const incidentsCtx = document.getElementById('incidentsChart');
        if (!incidentsCtx) {
            console.error('Chart canvas element not found');
            return;
        }
        
        // Destroy existing chart if it exists
        if (incidentsChart) {
            incidentsChart.destroy();
        }
        
        // Get month name for display
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthName = monthNames[now.getMonth()];
        const currentYear = now.getFullYear();
        
        console.log('Creating chart with labels:', labels.length, 'data points:', data.length); // Debug log
        
        incidentsChart = new Chart(incidentsCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Daily Security Incidents - ${currentMonthName} ${currentYear}`,
                    data: data,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return `${currentMonthName} ${context[0].label}, ${currentYear}`;
                            },
                            label: function(context) {
                                const incidents = context.parsed.y;
                                return `Incidents: ${incidents} ${incidents === 1 ? 'incident' : 'incidents'}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: `Date in ${currentMonthName} ${currentYear}`
                        },
                        ticks: {
                            maxTicksLimit: 15,
                            callback: function(value, index, values) {
                                if (values.length > 20) {
                                    return index % 2 === 0 ? this.getLabelForValue(value) : '';
                                }
                                return this.getLabelForValue(value);
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Incidents'
                        },
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return Number.isInteger(value) ? value : '';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        console.log('Chart created successfully'); // Debug log
    }

    // FIXED: Enhanced submitStatementForm to refresh chart after adding new statement
    async function submitStatementForm(event) {
        event.preventDefault();
        
        const formData = new FormData(statementForm);
        
        // Handle file upload
        const fileInput = document.getElementById('statementUploadedStatement');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('statementFile', fileInput.files[0]);
        }
        
        try {
            showLoadingIndicator();
            
            // Auto-capitalize form fields before submission
            const textInputs = statementForm.querySelectorAll('input[type="text"], textarea');
            textInputs.forEach(input => {
                if (input.value.length > 0) {
                    input.value = input.value.charAt(0).toUpperCase() + input.value.slice(1);
                }
            });
            
            // Prepare statement data as JSON object
            const statementData = {
                firstName: formData.get('statementFirstName'),
                secondName: formData.get('statementSecondName'),
                phoneNumber: document.getElementById('statementPhoneNumber')?.value || '',
                dateOfIncident: document.getElementById('statementDate')?.value || '',
                timeOfIncident: document.getElementById('statementTime')?.value || '',
                roomNumber: document.getElementById('statementRoomNumber')?.value || '',
                placeOfIncident: document.getElementById('statementPlaceOfIncident')?.value || '',
                securityName: document.getElementById('statementSecurityName')?.value || '',
                obNumber: document.getElementById('statementObNumber')?.value || '',
                incidentDescription: document.getElementById('statementIncidentDescription')?.value || '',
                designation: document.getElementById('statementDesignation')?.value || '',
                incidentCategory: document.getElementById('statementIncidentCategory')?.value || '',
            };
            
            // Send data to the API
            const response = await fetch('/api/statements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(statementData)
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // If there's a file to upload, handle it separately
            if (fileInput && fileInput.files.length > 0) {
                const fileData = new FormData();
                fileData.append('statementFile', fileInput.files[0]);
                fileData.append('statementId', result.id);
                fileData.append('fileName', fileInput.files[0].name);
                
                const fileResponse = await fetch('/api/statements/upload', {
                    method: 'POST',
                    body: fileData
                });
                
                if (!fileResponse.ok) {
                    throw new Error(`File upload error: ${fileResponse.status}`);
                }
            }
            
            displayNotification('Statement added successfully!', 'success');
            
            closeAddStatementModal();
            
            // FIXED: Reload data and refresh chart after adding new statement
            await loadStatements();
            updateIncidentCount();
            await loadIncidentsChart();
            
        } catch (error) {
            console.error('Error submitting statement:', error);
            displayNotification('Failed to add statement. Please try again.', 'error');
        } finally {
            hideLoadingIndicator();
        }
    }

    // Rest of your existing functions remain the same...
    function openAddStatementModal() {
        if (addStatementModal) {
            addStatementModal.style.display = 'block';
            if (statementForm) {
                statementForm.reset();
            }
        }
    }
    
    function closeAddStatementModal() {
        if (addStatementModal) {
            addStatementModal.style.display = 'none';
        }
    }
    
    function createFileViewerModal() {
        const fileViewerModal = document.createElement('div');
        fileViewerModal.id = 'fileViewerModal';
        fileViewerModal.className = 'modal';
        fileViewerModal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        `;
        
        fileViewerModal.innerHTML = `
            <div class="modal-dialog modal-lg" style="max-width: 90%; margin: 1.75rem auto;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Statement File</h5>
                        <button type="button" class="btn-close file-viewer-close" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" style="text-align: center; padding: 20px;">
                        <div id="fileViewerContent" style="width: 100%; min-height: 500px; display: flex; justify-content: center; align-items: center;">
                            <!-- Content will be loaded here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary file-viewer-close">Close</button>
                        <a id="fileDownloadBtn" class="btn btn-primary" download>Download File</a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(fileViewerModal);
        
        const closeButtons = fileViewerModal.querySelectorAll('.file-viewer-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeFileViewer();
            });
        });
        
        fileViewerModal.addEventListener('click', function(e) {
            if (e.target === fileViewerModal) {
                closeFileViewer();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && fileViewerModal.style.display === 'block') {
                closeFileViewer();
            }
        });
    }
    
    function openFileViewer(filePath, fileName) {
        const fileViewerModal = document.getElementById('fileViewerModal');
        const fileViewerContent = document.getElementById('fileViewerContent');
        const fileDownloadBtn = document.getElementById('fileDownloadBtn');
        
        if (!fileViewerModal || !fileViewerContent || !fileDownloadBtn) {
            console.error('File viewer modal elements not found');
            return;
        }
        
        fileViewerContent.innerHTML = '';
        
        const fileExtension = fileName.toLowerCase().split('.').pop();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const pdfExtensions = ['pdf'];
        
        if (imageExtensions.includes(fileExtension)) {
            const img = document.createElement('img');
            img.src = filePath;
            img.alt = fileName;
            img.style.cssText = `
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            
            img.onerror = function() {
                fileViewerContent.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Unable to display image. The file may be corrupted or in an unsupported format.</p>
                        <p>File: ${fileName}</p>
                    </div>
                `;
            };
            
            fileViewerContent.appendChild(img);
            
        } else if (pdfExtensions.includes(fileExtension)) {
            const iframe = document.createElement('iframe');
            iframe.src = filePath;
            iframe.style.cssText = `
                width: 100%;
                height: 70vh;
                border: none;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            
            iframe.onerror = function() {
                fileViewerContent.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-file-pdf"></i>
                        <p>Unable to display PDF in browser. Please download the file to view it.</p>
                        <p>File: ${fileName}</p>
                    </div>
                `;
            };
            
            fileViewerContent.appendChild(iframe);
            
        } else {
            fileViewerContent.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-file"></i>
                    <p>This file type cannot be previewed in the browser.</p>
                    <p>File: ${fileName}</p>
                    <p>Please use the download button to view the file.</p>
                </div>
            `;
        }
        
        fileDownloadBtn.href = filePath;
        fileDownloadBtn.download = fileName || 'statement-file';
        
        fileViewerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeFileViewer() {
        const fileViewerModal = document.getElementById('fileViewerModal');
        if (fileViewerModal) {
            fileViewerModal.style.display = 'none';
            document.body.style.overflow = '';
            
            const fileViewerContent = document.getElementById('fileViewerContent');
            if (fileViewerContent) {
                fileViewerContent.innerHTML = '';
            }
        }
    }
    
    function filterStatements(searchTerm) {
        if (!searchTerm) {
            renderStatements(allStatements);
            return;
        }
        
        const filteredStatements = allStatements.filter(statement => {
            const firstName = (statement.firstName || '').toLowerCase();
            const secondName = (statement.secondName || '').toLowerCase();
            const phoneNumber = (statement.phoneNumber || '').toLowerCase();
            const roomNumber = (statement.roomNumber || '').toLowerCase();
            const incidentCategory = (statement.incidentCategory || '').toLowerCase();
            const securityName = (statement.securityName || '').toLowerCase();
            const placeOfIncident = (statement.placeOfIncident || '').toLowerCase();
            const obNumber = (statement.obNumber || '').toLowerCase();
            const designation = (statement.designation || '').toLowerCase();
            const incidentDescription = (statement.incidentDescription || '').toLowerCase();
            
            return firstName.includes(searchTerm) ||
                   secondName.includes(searchTerm) ||
                   phoneNumber.includes(searchTerm) ||
                   roomNumber.includes(searchTerm) ||
                   incidentCategory.includes(searchTerm) ||
                   securityName.includes(searchTerm) ||
                   placeOfIncident.includes(searchTerm) ||
                   obNumber.includes(searchTerm) ||
                   designation.includes(searchTerm) ||
                   incidentDescription.includes(searchTerm);
        });
        
        renderStatements(filteredStatements);
    }
    
    async function updateIncidentCount() {
        try {
            const response = await fetch('/api/statements/count/monthly');
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            const incidentCount = data.count || 0;
            
            const incidentCards = document.querySelectorAll('.summary-card');
            incidentCards.forEach(card => {
                const heading = card.querySelector('h3');
                if (heading && heading.textContent.trim() === 'Incidents') {
                    const countElement = card.querySelector('p');
                    if (countElement) {
                        countElement.innerHTML = `${incidentCount} <small class="text-muted">(Engagements This Month)</small>`;
                    }
                }
            });
            
        } catch (error) {
            console.error('Error updating incident count:', error);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const monthlyIncidents = allStatements.filter(statement => {
                if (!statement.dateOfIncident) return false;
                const incidentDate = new Date(statement.dateOfIncident);
                return incidentDate.getMonth() === currentMonth && 
                       incidentDate.getFullYear() === currentYear;
            });
            
            const incidentCards = document.querySelectorAll('.summary-card');
            incidentCards.forEach(card => {
                const heading = card.querySelector('h3');
                if (heading && heading.textContent.trim() === 'Incidents') {
                    const countElement = card.querySelector('p');
                    if (countElement) {
                        countElement.innerHTML = `${monthlyIncidents.length} <small class="text-muted">(Engagements This Month)</small>`;
                    }
                }
            });
        }
    }
    
    // New function to render statements (separated for reuse in filtering)
    function renderStatements(statements) {
        if (!statementTableBody) {
            console.error('Statement table body not found');
            return;
        }
        
        statementTableBody.innerHTML = '';
        
        statements.forEach((statement, index) => {
            const capitalizeFirstLetter = (str) => {
                return str ? (str.charAt(0).toUpperCase() + str.slice(1)) : '';
            };
            
            const row = document.createElement('tr');
            row.className = 'statement-row';
            row.dataset.statementId = statement.id || index;
            
            const firstName = capitalizeFirstLetter(statement.firstName);
            const secondName = capitalizeFirstLetter(statement.secondName);
            const fullName = `${firstName} ${secondName}`;
            
            row.innerHTML = `
                <td>${fullName}</td>
                <td>${statement.phoneNumber}</td>
                <td>${statement.roomNumber}</td>
                <td>${capitalizeFirstLetter(statement.incidentCategory)}</td>
                <td>${capitalizeFirstLetter(statement.securityName)}</td>
                <td><button class="btn btn-sm btn-outline-info view-details-btn">Details</button></td>
            `;
            
            statementTableBody.appendChild(row);
            
            const detailsRow = document.createElement('tr');
            detailsRow.className = 'statement-details-row';
            detailsRow.style.display = 'none';
            
            const fileName = statement.filePath ? statement.filePath.split('/').pop() : '';
            
            let fileButtons = 'No file';
            if (statement.filePath) {
                fileButtons = `
                    <button class="btn btn-sm btn-primary view-file-btn" 
                       data-file-path="${statement.filePath}" 
                       data-file-name="${fileName}">View File</button>
                    <a href="${statement.filePath}" class="btn btn-sm btn-success" download="${fileName}">Download</a>
                `;
            }
            
            detailsRow.innerHTML = `
                <td colspan="6">
                    <div class="statement-details-container">
                        <div class="statement-details-header">
                            <h5>Incident Details</h5>
                            <button class="btn btn-sm btn-outline-secondary close-details-btn">Close</button>
                        </div>
                        
                        <div class="statement-details-grid">
                            <div class="detail-item">
                                <span class="detail-label">Name:</span>
                                <span class="detail-value">${fullName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Phone Number:</span>
                                <span class="detail-value">${statement.phoneNumber}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Date of Incident:</span>
                                <span class="detail-value">${formatDate(statement.dateOfIncident)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Time of Incident:</span>
                                <span class="detail-value">${statement.timeOfIncident}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Room Number:</span>
                                <span class="detail-value">${statement.roomNumber}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Place of Incident:</span>
                                <span class="detail-value">${capitalizeFirstLetter(statement.placeOfIncident)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Security Name:</span>
                                <span class="detail-value">${capitalizeFirstLetter(statement.securityName)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">OB Number:</span>
                                <span class="detail-value">${statement.obNumber}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Incident Category:</span>
                                <span class="detail-value">${capitalizeFirstLetter(statement.incidentCategory)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Designation:</span>
                                <span class="detail-value">${capitalizeFirstLetter(statement.designation)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Statement File:</span>
                                <span class="detail-value">${fileButtons}</span>
                            </div>
                        </div>
                        
                        <div class="description-container">
                            <h6>Incident Description:</h6>
                            <p>${capitalizeFirstLetter(statement.incidentDescription)}</p>
                        </div>
                    </div>
                </td>
            `;
            
            statementTableBody.appendChild(detailsRow);
        });
        
        attachEventListeners();
    }
    
    function attachEventListeners() {
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const mainRow = this.closest('.statement-row');
                const detailsRow = mainRow.nextElementSibling;
                
                document.querySelectorAll('.statement-details-row').forEach(row => {
                    if (row !== detailsRow) {
                        row.style.display = 'none';
                    }
                });
                
                detailsRow.style.display = detailsRow.style.display === 'none' ? 'table-row' : 'none';
            });
        });
        
        document.querySelectorAll('.close-details-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                this.closest('.statement-details-row').style.display = 'none';
            });
        });
        
        document.querySelectorAll('.view-file-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const filePath = this.dataset.filePath;
                const fileName = this.dataset.fileName;
                openFileViewer(filePath, fileName);
            });
        });
        
        document.querySelectorAll('.statement-row').forEach(row => {
            row.addEventListener('click', function() {
                const detailsRow = this.nextElementSibling;
                
                document.querySelectorAll('.statement-details-row').forEach(row => {
                    if (row !== detailsRow) {
                        row.style.display = 'none';
                    }
                });
                
                detailsRow.style.display = detailsRow.style.display === 'none' ? 'table-row' : 'none';
            });
        });
    }

    

    function exportStatementData() {
        try {
            // Show loading indicator
            showLoadingIndicator();
            
            // Create a link to download the exported data
            fetch('/api/statements/export')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Export failed');
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `statements_export_${formatDateForFilename(new Date())}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    displayNotification('Statements exported successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error exporting statements:', error);
                    displayNotification('Failed to export statements. Please try again.', 'error');
                })
                .finally(() => {
                    hideLoadingIndicator();
                });
        } catch (error) {
            console.error('Error initiating export:', error);
            displayNotification('Failed to start export process. Please try again.', 'error');
            hideLoadingIndicator();
        }
    }
    
    // Helper Functions
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
    }
    
    function formatDateForFilename(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    
    function showLoadingIndicator() {
        // Create loading indicator if it doesn't exist
        let loadingIndicator = document.getElementById('loadingIndicator');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loadingIndicator';
            loadingIndicator.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            `;
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.zIndex = '1100';
            document.body.appendChild(loadingIndicator);
        }
        loadingIndicator.style.display = 'block';
    }
    
    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    function displayNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1050';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type}`;
        notification.textContent = message;
        notification.style.marginBottom = '10px';
        notification.style.minWidth = '250px';
        
        // Add notification to container
        notificationContainer.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    


   
   
// Fallback function using local statements data for daily incidents
function loadIncidentsChartFromLocalData() {
    const incidentsCtx = document.getElementById('incidentsChart');
    if (!incidentsCtx || !allStatements) return;
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Initialize daily data for current month
    const dailyData = {};
    const labels = [];
    
    // Create labels for all days in current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${day}`;
        labels.push(dateStr);
        dailyData[dateStr] = 0;
    }
    
    // Count incidents by day for current month
    allStatements.forEach(statement => {
        if (statement.dateOfIncident) {
            const date = new Date(statement.dateOfIncident);
            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                const day = date.getDate().toString();
                if (dailyData.hasOwnProperty(day)) {
                    dailyData[day]++;
                }
            }
        }
    });
    
    // Convert to array for chart
    const chartData = labels.map(day => dailyData[day]);
    
    // Get month name for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = monthNames[currentMonth];
    
    new Chart(incidentsCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Daily Security Incidents - ${currentMonthName} ${currentYear}`,
                data: chartData,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#007bff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return `${currentMonthName} ${context[0].label}, ${currentYear}`;
                        },
                        label: function(context) {
                            const incidents = context.parsed.y;
                            return `Incidents: ${incidents} ${incidents === 1 ? 'incident' : 'incidents'}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: `Date in ${currentMonthName} ${currentYear}`
                    },
                    ticks: {
                        maxTicksLimit: 15, // Limit number of x-axis labels for readability
                        callback: function(value, index, values) {
                            // Show every 2nd or 3rd date depending on month length
                            if (daysInMonth > 20) {
                                return index % 2 === 0 ? this.getLabelForValue(value) : '';
                            }
                            return this.getLabelForValue(value);
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Incidents'
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}



// Also update the chart subtitle in HTML to reflect the change
function updateChartSubtitle() {
    const chartSubtitle = document.querySelector('.chart-subtitle');
    if (chartSubtitle) {
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthName = monthNames[now.getMonth()];
        const currentYear = now.getFullYear();
        
        chartSubtitle.textContent = `Daily incidents for ${currentMonthName} ${currentYear}`;
    }
}

});