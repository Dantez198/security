// Fire Alarm Management Module
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements for Fire Alarm Section
    const fireAlarmSection = document.getElementById('fireAlarmsSection');
    const fireAlarmModal = document.getElementById('addFireAlarmModal');
    const fireAlarmForm = document.getElementById('fireAlarmForm');
    const fireAlarmTable = document.getElementById('fireAlarmTable');
    const fireAlarmTableBody = document.getElementById('fireAlarmTableBody');
    const fireAlarmSearchInput = document.getElementById('fireAlarmSearchInput');
    const fireAlarmSearchBtn = document.getElementById('fireAlarmSearchBtn');
    const addFireAlarmBtn = document.getElementById('addFireAlarmBtn');
    const exportFireAlarmDataBtn = document.getElementById('exportFireAlarmDataBtn');
    const monthFilterSelect = document.getElementById('fireAlarmMonthFilter');
    
    // Fire Alarm data array
    let fireAlarmData = [];
    let filteredFireAlarmData = [];
    let fireAlarmChart = null; // Store chart instance
    
    // Initialize the Fire Alarm Module
    function initFireAlarmModule() {
        // Load data from API
        loadFireAlarmData();
        
        // Set up event listeners
        setupFireAlarmEventListeners();
        
        // Setup month filter dropdown
        populateMonthFilter();
        
        // Initialize chart after a short delay to ensure DOM is ready
        setTimeout(() => {
            initializeFireAlarmChart();
        }, 100);
    }
    
    // Initialize Fire Alarm Chart
    function initializeFireAlarmChart() {
        const fireAlarmCtx = document.getElementById('fireAlarmChart');
        if (!fireAlarmCtx) {
            console.warn('Fire alarm chart canvas not found');
            return;
        }

        const ctx = fireAlarmCtx.getContext('2d');
        
        fireAlarmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Fire Alarms',
                    data: [],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#dc3545',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#374151',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#dc3545',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return 'Date: ' + context[0].label;
                            },
                            label: function(context) {
                                return 'Fire Alarms: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#374151',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 8
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Number of Alarms',
                            color: '#374151',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 10
                            },
                            stepSize: 1,
                            beginAtZero: true
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
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
    
    // Update Fire Alarm Chart with current month data
    function updateFireAlarmChart() {
        if (!fireAlarmChart) {
            console.warn('Fire alarm chart not initialized');
            return;
        }

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Get number of days in current month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Create array for all days in current month
        const dailyData = {};
        
        // Initialize all days with 0 alarms
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dailyData[dateKey] = 0;
        }
        
        // Count alarms for each day in current month
        fireAlarmData.forEach(alarm => {
            const alarmDate = new Date(alarm.date);
            if (alarmDate.getMonth() === currentMonth && alarmDate.getFullYear() === currentYear) {
                const dateKey = alarm.date;
                if (dailyData.hasOwnProperty(dateKey)) {
                    dailyData[dateKey]++;
                }
            }
        });
        
        // Convert to arrays for Chart.js
        const labels = [];
        const data = [];
        
        Object.keys(dailyData).sort().forEach(dateKey => {
            const date = new Date(dateKey);
            // Format as "Dec 1", "Dec 2", etc.
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            labels.push(formattedDate);
            data.push(dailyData[dateKey]);
        });
        
        // Update chart data
        fireAlarmChart.data.labels = labels;
        fireAlarmChart.data.datasets[0].data = data;
        
        // Update the chart
        fireAlarmChart.update();
    }
    
    // Populate month filter dropdown
    function populateMonthFilter() {
        if (!monthFilterSelect) return;
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        
        // Add "All" option
        const allOption = document.createElement('option');
        allOption.value = "all";
        allOption.textContent = `All Records`;
        monthFilterSelect.appendChild(allOption);
        
        // Add month options for current year
        for (let i = 0; i < 12; i++) {
            const option = document.createElement('option');
            const monthDate = new Date(currentYear, i, 1);
            option.value = i;
            option.textContent = `${getMonthName(i)} ${currentYear}`;
            if (i === currentDate.getMonth()) {
                option.selected = true;
            }
            monthFilterSelect.appendChild(option);
        }
    }
    
    // Load Fire Alarm data from API
    function loadFireAlarmData() {
        // Show loading indicator
        showLoadingIndicator(fireAlarmTableBody, 'Loading fire alarm records...');
        
        fetch('/api/fire-alarms')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                fireAlarmData = data || [];
                // Filter for current month by default
                filterByCurrentMonth();
                // Update dashboard with new data
                updateFireAlarmDashboard();
                // Update the chart
                updateFireAlarmChart();
            })
            .catch(error => {
                console.error('Error loading fire alarm data:', error);
                showNotification('Failed to load fire alarm records. Please check network connection.', 'error', 5000);
                // Display error message in table
                showErrorMessage(fireAlarmTableBody, 'Failed to load fire alarm records. Please try again.');
            });
    }
    
    // Filter data by current month
    function filterByCurrentMonth() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        filteredFireAlarmData = fireAlarmData.filter(alarm => {
            const alarmDate = new Date(alarm.date);
            return alarmDate.getMonth() === currentMonth && 
                   alarmDate.getFullYear() === currentYear;
        });
        
        renderFireAlarmTable(filteredFireAlarmData);
    }
    
    // Show loading indicator in table
    function showLoadingIndicator(tableBody, message) {
        tableBody.innerHTML = '';
        const loadingRow = document.createElement('tr');
        const loadingCell = document.createElement('td');
        loadingCell.colSpan = 8;
        loadingCell.textContent = message;
        loadingCell.style.textAlign = 'center';
        loadingCell.style.padding = '20px';
        loadingRow.appendChild(loadingCell);
        tableBody.appendChild(loadingRow);
    }
    
    // Show error message in table
    function showErrorMessage(tableBody, message) {
        tableBody.innerHTML = '';
        const errorRow = document.createElement('tr');
        const errorCell = document.createElement('td');
        errorCell.colSpan = 8;
        errorCell.textContent = message;
        errorCell.style.textAlign = 'center';
        errorCell.style.color = 'red';
        errorCell.style.padding = '20px';
        errorRow.appendChild(errorCell);
        tableBody.appendChild(errorRow);
    }
    
    // Set up event listeners for Fire Alarm section
    function setupFireAlarmEventListeners() {
        // Open modal to add new fire alarm record
        if (addFireAlarmBtn) {
            addFireAlarmBtn.addEventListener('click', () => {
                openFireAlarmModal();
            });
        }
        
        // Submit fire alarm form
        if (fireAlarmForm) {
            fireAlarmForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitFireAlarmForm();
            });
        }
        
        // Close modal buttons
        document.querySelectorAll('#addFireAlarmModal .cancel-btn').forEach(btn => {
            btn.addEventListener('click', closeFireAlarmModal);
        });
        
        // Search functionality
        if (fireAlarmSearchInput) {
            fireAlarmSearchInput.addEventListener('input', () => {
                filterFireAlarmTable(fireAlarmSearchInput.value.trim().toLowerCase());
            });
        }
        
        if (fireAlarmSearchBtn) {
            fireAlarmSearchBtn.addEventListener('click', () => {
                filterFireAlarmTable(fireAlarmSearchInput.value.trim().toLowerCase());
            });
        }
        
        // Export data
        if (exportFireAlarmDataBtn) {
            exportFireAlarmDataBtn.addEventListener('click', exportFireAlarmData);
        }
        
        // Month filter change
        if (monthFilterSelect) {
            monthFilterSelect.addEventListener('change', () => {
                const selectedValue = monthFilterSelect.value;
                if (selectedValue === 'all') {
                    filteredFireAlarmData = [...fireAlarmData];
                } else {
                    const month = parseInt(selectedValue);
                    const currentYear = new Date().getFullYear();
                    
                    filteredFireAlarmData = fireAlarmData.filter(alarm => {
                        const alarmDate = new Date(alarm.date);
                        return alarmDate.getMonth() === month && 
                               alarmDate.getFullYear() === currentYear;
                    });
                }
                renderFireAlarmTable(filteredFireAlarmData);
            });
        }
        
        // Listen for "View All" button on home page
        const viewAllFireAlarmsBtn = document.querySelector('#homeSection button[onclick="showSection(\'fireAlarmsSection\')"]');
        if (viewAllFireAlarmsBtn) {
            viewAllFireAlarmsBtn.addEventListener('click', () => {
                // Select current month in filter when navigating from home
                if (monthFilterSelect) {
                    const currentMonth = new Date().getMonth();
                    monthFilterSelect.value = currentMonth;
                    
                    // Trigger the change event to filter data
                    const event = new Event('change');
                    monthFilterSelect.dispatchEvent(event);
                }
            });
        }
    }
    
    // Open Fire Alarm Modal with current date and time
    function openFireAlarmModal() {
        // Get current date and time
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        // Format time as HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        
        // Set default values in form
        document.getElementById('Date').value = currentDate;
        document.getElementById('time').value = currentTime;
        
        // Clear other form fields
        document.getElementById('room_number').value = '';
        document.getElementById('floor').value = '';
        document.getElementById('triggered_by').value = '';
        document.getElementById('alarm_level').value = '';
        document.getElementById('action_taken').value = '';
        document.getElementById('security_assistant').value = '';
        
        // Show modal
        fireAlarmModal.style.display = 'block';
    }
    
    // Close Fire Alarm Modal
    function closeFireAlarmModal() {
        fireAlarmModal.style.display = 'none';
    }
    
    // Submit Fire Alarm Form
    function submitFireAlarmForm() {
        // Get form values
        const securityAssistantValue = document.getElementById('security_assistant').value.trim();
        
        // Validate security assistant has first and last name
        const nameArray = securityAssistantValue.split(' ').filter(part => part.length > 0);
        if (nameArray.length < 2) {
            showNotification('Please enter both first and last name for Security Assistant', 'error', 5000);
            // Highlight the field
            const inputField = document.getElementById('security_assistant');
            inputField.style.borderColor = '#f44336';
            inputField.addEventListener('input', function() {
                this.style.borderColor = ''; // Reset border on input
            }, { once: true });
            return; // Stop submission
        }
        
        const formData = {
            date: document.getElementById('Date').value,
            time: document.getElementById('time').value,
            room_number: capitalizeFirstLetter(document.getElementById('room_number').value),
            floor: capitalizeFirstLetter(document.getElementById('floor').value),
            triggered_by: capitalizeFirstLetter(document.getElementById('triggered_by').value),
            alarm_level: document.getElementById('alarm_level').value,
            action_taken: capitalizeFirstLetter(document.getElementById('action_taken').value),
            security_assistant: capitalizeFirstLetter(securityAssistantValue)
        };
        
        // Send data to API
        fetch('/api/fire-alarms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                showNotification('Fire alarm record added successfully!', 'success', 3000);
                closeFireAlarmModal();
                
                // Add the new alarm to the local data
                if (data.alarm) {
                    fireAlarmData.push(data.alarm);
                } else {
                    // If the API doesn't return the new alarm, add the formData with a temporary ID
                    const newAlarm = {
                        ...formData,
                        id: Date.now() // Use timestamp as temporary ID
                    };
                    fireAlarmData.push(newAlarm);
                }
                
                // Update filtered data
                if (monthFilterSelect && monthFilterSelect.value !== 'all') {
                    const selectedMonth = parseInt(monthFilterSelect.value);
                    const alarmDate = new Date(formData.date);
                    
                    if (alarmDate.getMonth() === selectedMonth) {
                        filteredFireAlarmData.push(formData.id ? formData : (data.alarm || newAlarm));
                    }
                } else {
                    filteredFireAlarmData = [...fireAlarmData];
                }
                
                // Update the UI
                renderFireAlarmTable(filteredFireAlarmData);
                updateFireAlarmDashboard(); // Update the dashboard with the new alarm count
                updateFireAlarmChart(); // Update the chart with new data
            } else {
                showNotification('Error: ' + (data.error || 'Failed to save record'), 'error', 5000);
            }
        })
        .catch(error => {
            console.error('Error saving fire alarm record:', error);
            showNotification('Failed to save fire alarm record. Please try again.', 'error', 5000);
        });
    }
    
    // Create and show a notification message
    function showNotification(message, type, duration = 3000) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '5px';
        notification.style.fontSize = '14px';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        notification.style.transition = 'opacity 0.5s ease';
        
        // Apply specific styles based on type
        if (type === 'error') {
            notification.style.backgroundColor = '#f44336';
            notification.style.color = 'white';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
        } else if (type === 'info') {
            notification.style.backgroundColor = '#2196F3';
            notification.style.color = 'white';
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, duration);
    }
    
    // Render Fire Alarm Table
    function renderFireAlarmTable(data) {
        // Clear existing table rows
        fireAlarmTableBody.innerHTML = '';
        
        if (data.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 8;
            emptyCell.textContent = 'No fire alarm records found for the selected criteria';
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = '20px';
            emptyRow.appendChild(emptyCell);
            fireAlarmTableBody.appendChild(emptyRow);
            return;
        }
        
        // Sort data by date (most recent first)
        const sortedData = [...data].sort((a, b) => {
            // Compare dates first
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            // If dates are the same, compare times
            return a.time < b.time ? 1 : -1;
        });
        
        // Add rows for each data item
        sortedData.forEach(alarm => {
            const row = document.createElement('tr');
            
            // Create cell for each field
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDateLong(alarm.date);
            
            const timeCell = document.createElement('td');
            timeCell.textContent = alarm.time;
            
            const roomCell = document.createElement('td');
            roomCell.textContent = alarm.room_number;
            
            const floorCell = document.createElement('td');
            floorCell.textContent = alarm.floor;
            
            const triggeredByCell = document.createElement('td');
            triggeredByCell.textContent = alarm.triggered_by;
            
            const alarmLevelCell = document.createElement('td');
            alarmLevelCell.textContent = alarm.alarm_level;
            
            // Set color based on alarm level
            if (alarm.alarm_level === 'High') {
                alarmLevelCell.style.color = 'red';
                alarmLevelCell.style.fontWeight = 'bold';
            } else if (alarm.alarm_level === 'Medium') {
                alarmLevelCell.style.color = 'orange';
                alarmLevelCell.style.fontWeight = 'bold';
            } else {
                alarmLevelCell.style.color = 'green';
                alarmLevelCell.style.fontWeight = 'bold';
            }
            
            const actionCell = document.createElement('td');
            actionCell.textContent = alarm.action_taken;
            
            const securityCell = document.createElement('td');
            securityCell.textContent = alarm.security_assistant;
            
            // Append cells to row
            row.appendChild(dateCell);
            row.appendChild(timeCell);
            row.appendChild(roomCell);
            row.appendChild(floorCell);
            row.appendChild(triggeredByCell);
            row.appendChild(alarmLevelCell);
            row.appendChild(actionCell);
            row.appendChild(securityCell);
            
            // Append row to table body
            fireAlarmTableBody.appendChild(row);
        });
    }
    
    // Filter Fire Alarm Table based on search term
    function filterFireAlarmTable(searchTerm) {
        if (!searchTerm) {
            renderFireAlarmTable(filteredFireAlarmData);
            return;
        }
        
        const searchResults = filteredFireAlarmData.filter(alarm => {
            // Search across multiple fields
            return (
                String(formatDateLong(alarm.date)).toLowerCase().includes(searchTerm) ||
                alarm.time.toLowerCase().includes(searchTerm) ||
                alarm.room_number.toLowerCase().includes(searchTerm) ||
                alarm.floor.toLowerCase().includes(searchTerm) ||
                alarm.triggered_by.toLowerCase().includes(searchTerm) ||
                alarm.alarm_level.toLowerCase().includes(searchTerm) ||
                alarm.action_taken.toLowerCase().includes(searchTerm) ||
                alarm.security_assistant.toLowerCase().includes(searchTerm)
            );
        });
        
        renderFireAlarmTable(searchResults);
    }
    
    // Export Fire Alarm Data as CSV
    function exportFireAlarmData() {
        if (filteredFireAlarmData.length === 0) {
            showNotification('No data to export', 'info', 3000);
            return;
        }
        
        // Create CSV headers
        let csvContent = 'Date,Time,Room Number,Floor,Triggered By,Fire Alarm Level,Action Taken,Security Assistant\n';
        
        // Add rows
        filteredFireAlarmData.forEach(alarm => {
            const row = [
                formatDateLong(alarm.date),
                alarm.time,
                alarm.room_number,
                alarm.floor,
                alarm.triggered_by,
                alarm.alarm_level,
                alarm.action_taken,
                alarm.security_assistant
            ].map(cell => `"${cell || ''}"`).join(',');
            
            csvContent += row + '\n';
        });
        
        // Create download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        
        // Set filename with current filter
        let filename = 'fire_alarm_records';
        if (monthFilterSelect && monthFilterSelect.value !== 'all') {
            const selectedMonth = parseInt(monthFilterSelect.value);
            filename += `_${getMonthName(selectedMonth)}_${new Date().getFullYear()}`;
        } else {
            filename += `_all_records`;
        }
        filename += `_exported_${formatDateForFilename(new Date())}.csv`;
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        
        // Trigger download and remove link
        link.click();
        document.body.removeChild(link);
        
        showNotification('Export completed successfully!', 'success', 3000);
    }
    
    // Helper function: Capitalize first letter of each word
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Helper function: Format date as DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    }
    
    // Helper function: Format date as "Apr 10, 2025"
    function formatDateLong(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Helper function: Format date for filename
    function formatDateForFilename(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    
    // Function to update fire alarm counts on home dashboard
    function updateFireAlarmDashboard() {
        // Get current date to determine current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Count alarms for current month
        const currentMonthAlarms = fireAlarmData.filter(alarm => {
            const alarmDate = new Date(alarm.date);
            return alarmDate.getMonth() === currentMonth && 
                  alarmDate.getFullYear() === currentYear;
        });
        
        // Update counter in home section
        const alarmCounter = document.querySelector('.summary-card.light-blue p');
        if (alarmCounter) {
            alarmCounter.innerHTML = `${currentMonthAlarms.length} <small class="text-muted">(This Month)</small>`;
        }
        
        // Get recent alarms for the table (most recent first)
        const recentAlarms = [...fireAlarmData]
            .sort((a, b) => new Date(b.date) - new Date(a.date) || (a.time < b.time ? 1 : -1))
            .slice(0, 3); // Get top 3 most recent
        
        // Update recent fire alarms table on home page
        updateHomeDashboardTable(recentAlarms);
    }
    
    // Update the home dashboard table with recent alarms
    function updateHomeDashboardTable(recentAlarms) {
        // Find the table using a more reliable selector
        const homeSection = document.getElementById('homeSection');
        if (!homeSection) return;
        
        // Find all card headers in the home section
        const cardHeaders = homeSection.querySelectorAll('.card-header');
        let recentAlarmsTable = null;
        
        // Find the header with "Recent Fire Alarm Incidents" text
        for (let header of cardHeaders) {
            if (header.textContent.includes('Recent Fire Alarm Incidents')) {
                // Get the table in this card's body
                recentAlarmsTable = header.closest('.card').querySelector('tbody');
                break;
            }
        }
        
        if (!recentAlarmsTable) return;
        
        // Clear existing rows in the table
        recentAlarmsTable.innerHTML = '';
        
        // Check if there are any alarms to display
        if (recentAlarms.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.setAttribute('colspan', '4'); // Span across all 4 columns
            emptyCell.textContent = 'No recent fire alarm incidents';
            emptyCell.style.textAlign = 'center';
            emptyRow.appendChild(emptyCell);
            recentAlarmsTable.appendChild(emptyRow);
            return;
        }
        
        
        // Add rows for each recent alarm
        recentAlarms.forEach(alarm => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDateLong(alarm.date);
            
            const roomCell = document.createElement('td');
            roomCell.textContent = `${alarm.room_number}, ${alarm.floor}`;
            
            const levelCell = document.createElement('td');
            levelCell.textContent = alarm.alarm_level;
            // Apply color based on level
            if (alarm.alarm_level === 'High') {
                levelCell.style.fontWeight = 'bold';
            } else if (alarm.alarm_level === 'Medium') {
                levelCell.style.color = 'orange';
                levelCell.style.fontWeight = 'bold';
            } else {
                levelCell.style.color = 'green';
                levelCell.style.fontWeight = 'bold';
            }
            
            const assistantCell = document.createElement('td');
            assistantCell.textContent = alarm.security_assistant;
            
            row.appendChild(dateCell);
            row.appendChild(roomCell);
            row.appendChild(levelCell);
            row.appendChild(assistantCell);
            
            recentAlarmsTable.appendChild(row);
        });
    }
    
    // Helper function: Get month name from month number
    function getMonthName(monthNumber) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNumber] || '';
    }
    
    // Function to refresh fire alarm data
    function refreshFireAlarmData() {
        loadFireAlarmData();
    }
    
    // Function to get fire alarm statistics
    function getFireAlarmStats() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Current month stats
        const currentMonthAlarms = fireAlarmData.filter(alarm => {
            const alarmDate = new Date(alarm.date);
            return alarmDate.getMonth() === currentMonth && 
                   alarmDate.getFullYear() === currentYear;
        });
        
        // Previous month stats
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevMonthAlarms = fireAlarmData.filter(alarm => {
            const alarmDate = new Date(alarm.date);
            return alarmDate.getMonth() === prevMonth && 
                   alarmDate.getFullYear() === prevYear;
        });
        
        // Alarm level distribution for current month
        const alarmLevels = currentMonthAlarms.reduce((acc, alarm) => {
            acc[alarm.alarm_level] = (acc[alarm.alarm_level] || 0) + 1;
            return acc;
        }, {});
        
        // Most active floors
        const floorActivity = currentMonthAlarms.reduce((acc, alarm) => {
            acc[alarm.floor] = (acc[alarm.floor] || 0) + 1;
            return acc;
        }, {});
        
        // Top triggered by causes
        const triggerCauses = currentMonthAlarms.reduce((acc, alarm) => {
            acc[alarm.triggered_by] = (acc[alarm.triggered_by] || 0) + 1;
            return acc;
        }, {});
        
        return {
            currentMonth: {
                total: currentMonthAlarms.length,
                alarms: currentMonthAlarms,
                levels: alarmLevels,
                floors: floorActivity,
                triggers: triggerCauses
            },
            previousMonth: {
                total: prevMonthAlarms.length
            },
            trend: {
                direction: currentMonthAlarms.length > prevMonthAlarms.length ? 'up' : 
                          currentMonthAlarms.length < prevMonthAlarms.length ? 'down' : 'stable',
                change: Math.abs(currentMonthAlarms.length - prevMonthAlarms.length),
                percentage: prevMonthAlarms.length > 0 ? 
                           Math.round(((currentMonthAlarms.length - prevMonthAlarms.length) / prevMonthAlarms.length) * 100) : 0
            }
        };
    }
    
    // Function to handle window resize for chart responsiveness
    function handleChartResize() {
        if (fireAlarmChart) {
            fireAlarmChart.resize();
        }
    }
    
    // Add window resize listener
    window.addEventListener('resize', handleChartResize);
    
    // Function to validate form data
    function validateFireAlarmForm() {
        const requiredFields = [
            { id: 'Date', name: 'Date' },
            { id: 'time', name: 'Time' },
            { id: 'room_number', name: 'Room Number' },
            { id: 'floor', name: 'Floor' },
            { id: 'triggered_by', name: 'Triggered By' },
            { id: 'alarm_level', name: 'Alarm Level' },
            { id: 'action_taken', name: 'Action Taken' },
            { id: 'security_assistant', name: 'Security Assistant' }
        ];
        
        const errors = [];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                errors.push(`${field.name} is required`);
                if (element) {
                    element.style.borderColor = '#f44336';
                    element.addEventListener('input', function() {
                        this.style.borderColor = '';
                    }, { once: true });
                }
            }
        });
        
        // Validate date is not in the future
        const dateInput = document.getElementById('Date');
        if (dateInput && dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate > today) {
                errors.push('Date cannot be in the future');
                dateInput.style.borderColor = '#f44336';
                dateInput.addEventListener('input', function() {
                    this.style.borderColor = '';
                }, { once: true });
            }
        }
        
        // Validate time format and not in future if today
        const timeInput = document.getElementById('time');
        if (timeInput && timeInput.value && dateInput && dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            
            if (selectedDate.toDateString() === today.toDateString()) {
                const [hours, minutes] = timeInput.value.split(':').map(Number);
                const selectedTime = new Date(today);
                selectedTime.setHours(hours, minutes, 0, 0);
                
                if (selectedTime > new Date()) {
                    errors.push('Time cannot be in the future for today\'s date');
                    timeInput.style.borderColor = '#f44336';
                    timeInput.addEventListener('input', function() {
                        this.style.borderColor = '';
                    }, { once: true });
                }
            }
        }
        
        return errors;
    }
    
    // Enhanced submit function with validation
    function submitFireAlarmFormEnhanced() {
        // Validate form
        const validationErrors = validateFireAlarmForm();
        if (validationErrors.length > 0) {
            showNotification(validationErrors[0], 'error', 5000);
            return;
        }
        
        // Continue with original submit logic
        submitFireAlarmForm();
    }
    
    // Function to clear all form validation styles
    function clearFormValidation() {
        const formInputs = fireAlarmForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.style.borderColor = '';
        });
    }
    
    // Enhanced modal open function
    function openFireAlarmModalEnhanced() {
        // Clear any previous validation styles
        clearFormValidation();
        
        // Call original function
        openFireAlarmModal();
    }
    
    // Function to handle keyboard shortcuts
    function handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + N to add new fire alarm
        if ((event.ctrlKey || event.metaKey) && event.key === 'n' && 
            document.getElementById('fireAlarmsSection').style.display !== 'none') {
            event.preventDefault();
            openFireAlarmModal();
        }
        
        // Escape to close modal
        if (event.key === 'Escape' && fireAlarmModal.style.display === 'block') {
            closeFireAlarmModal();
        }
        
        // Ctrl/Cmd + E to export data
        if ((event.ctrlKey || event.metaKey) && event.key === 'e' && 
            document.getElementById('fireAlarmsSection').style.display !== 'none') {
            event.preventDefault();
            exportFireAlarmData();
        }
    }
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Function to auto-save form data to prevent data loss
    function autoSaveFormData() {
        if (fireAlarmModal.style.display === 'block') {
            const formData = {
                date: document.getElementById('Date').value,
                time: document.getElementById('time').value,
                room_number: document.getElementById('room_number').value,
                floor: document.getElementById('floor').value,
                triggered_by: document.getElementById('triggered_by').value,
                alarm_level: document.getElementById('alarm_level').value,
                action_taken: document.getElementById('action_taken').value,
                security_assistant: document.getElementById('security_assistant').value
            };
            
            // Store in memory (not localStorage as per restrictions)
            window.fireAlarmFormDraft = formData;
        }
    }
    
    // Function to restore form data
    function restoreFormData() {
        if (window.fireAlarmFormDraft) {
            const draft = window.fireAlarmFormDraft;
            
            Object.keys(draft).forEach(key => {
                const element = document.getElementById(key === 'date' ? 'Date' : key);
                if (element && draft[key]) {
                    element.value = draft[key];
                }
            });
            
            // Clear the draft after restoring
            delete window.fireAlarmFormDraft;
        }
    }
    
    // Auto-save form data every 30 seconds
    setInterval(autoSaveFormData, 30000);
    
    // Public API for the module
    window.FireAlarmModule = {
        init: initFireAlarmModule,
        refresh: refreshFireAlarmData,
        getStats: getFireAlarmStats,
        openModal: openFireAlarmModal,
        closeModal: closeFireAlarmModal,
        exportData: exportFireAlarmData,
        updateChart: updateFireAlarmChart,
        updateDashboard: updateFireAlarmDashboard
    };
    
    // Initialize the module when DOM is ready
    initFireAlarmModule();
    
    // Console log for debugging
    console.log('Fire Alarm Management Module loaded successfully');
});