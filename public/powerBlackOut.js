// Main JavaScript for integrating Power Blackout data with home section
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements for both sections
    const homeSection = document.getElementById('homeSection');
    const powerBlackoutSection = document.getElementById('powerBlackoutSection');
    const blackoutTableBody = document.getElementById('blackoutTableBody');
    const addBlackoutBtn = document.getElementById('addBlackoutBtn');
    const addBlackoutModal = document.getElementById('addBlackoutModal');
    const blackoutForm = document.getElementById('blackoutForm');
    const blackoutSearchInput = document.getElementById('blackoutSearchInput');
    const blackoutSearchBtn = document.getElementById('blackoutSearchBtn');
    const exportBlackoutDataBtn = document.getElementById('exportBlackoutDataBtn');
    
    // Home section elements for power blackout data
    const homeBlackoutTableBody = document.querySelector('#homeSection .card:nth-child(1) table tbody');
    const homePowerBlackoutCount = document.querySelector('.dashboard-summary .col-md-3:nth-child(1) .summary-card p');
    
    // Event listeners
    if (addBlackoutBtn) {
        addBlackoutBtn.addEventListener('click', openAddBlackoutModal);
    }

    // Close modal when cancel button is clicked
    if (addBlackoutModal) {
        const cancelBtn = addBlackoutModal.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeAddBlackoutModal);
        }
    }

    // Handle form submission
    if (blackoutForm) {
        blackoutForm.addEventListener('submit', submitBlackoutData);
    }

    // Handle search
    if (blackoutSearchBtn) {
        blackoutSearchBtn.addEventListener('click', searchBlackoutRecords);
    }

    // Handle export data
    if (exportBlackoutDataBtn) {
        exportBlackoutDataBtn.addEventListener('click', exportBlackoutData);
    }

    // Initialize data on page load
    loadAllBlackoutData();

    // Functions
    function openAddBlackoutModal() {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('blackoutDate').value = today;
        
        // Reset form
        blackoutForm.reset();
        document.getElementById('blackoutDate').value = today;
        
        // Display modal
        addBlackoutModal.style.display = 'block';
    }

    function closeAddBlackoutModal() {
        addBlackoutModal.style.display = 'none';
    }

    function submitBlackoutData(e) {
        e.preventDefault();
        
        // Get form data
        const date = document.getElementById('blackoutDate').value;
        const generator_start_time = document.getElementById('generatorStartTime').value;
        const fuel_level_before = document.getElementById('fuelLevelBefore').value;
        const generator_stop_time = document.getElementById('generatorStopTime').value;
        const fuel_level_after = document.getElementById('fuelLevelAfter').value;
        const security_assistant_name = document.getElementById('securityAssistantName').value;

        // Calculate run duration
        const start = new Date(`${date}T${generator_start_time}`);
        const stop = new Date(`${date}T${generator_stop_time}`);
        
        // Handle case when stop time is on the next day
        let diffMs = stop - start;
        if (diffMs < 0) {
            // Add 24 hours if stop time is on the next day
            diffMs += 24 * 60 * 60 * 1000;
        }
        
        // Format duration as HH:MM:SS
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        const run_duration = `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;

        // Calculate fuel used
        const fuel_used = fuel_level_before - fuel_level_after;
        
        // Determine fuel status
        let fuel_status = '';
        if (fuel_level_after <= 59) {
            fuel_status = 'Critical';
        } else if (fuel_level_after <= 97) {
            fuel_status = 'Average';
        } else {
            fuel_status = 'Good';
        }

        // Create data object
        const blackoutData = {
            date,
            generator_start_time,
            fuel_level_before,
            generator_stop_time,
            fuel_level_after,
            run_duration,
            fuel_used,
            security_assistant_name,
            fuel_status
        };

        // Send data to server
        fetch('/api/power-blackouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(blackoutData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('Power blackout record added successfully!');
            closeAddBlackoutModal();
            loadAllBlackoutData(); // Refresh all data including home section
        })
        .catch(error => {
            console.error('Error adding power blackout record:', error);
            alert('Failed to add power blackout record. Please try again.');
        });
    }

    function loadAllBlackoutData() {
        fetch('/api/power-blackouts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Display data in both sections
                displayBlackoutData(data);
                updateHomeBlackoutData(data);
                updateBlackoutCounters(data);
            })
            .catch(error => {
                console.error('Error fetching power blackout records:', error);
                alert('Failed to load power blackout records. Please refresh the page.');
            });
    }

    function displayBlackoutData(data) {
        // Only proceed if the blackout table body exists (in Power Blackout section)
        if (!blackoutTableBody) return;
        
        // Clear existing data
        blackoutTableBody.innerHTML = '';

        // Check if there's no data
        if (data.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `<td colspan="8" class="no-data">No power blackout records found</td>`;
            blackoutTableBody.appendChild(noDataRow);
            return;
        }

        // Add each record to the table
        data.forEach(record => {
            const row = document.createElement('tr');
            
            // Format date for display
            const dateObj = new Date(record.date);
            const formattedDate = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            
            // Apply color based on fuel status
            let statusClass = '';
            if (record.fuel_status === 'Critical') {
                statusClass = 'status-critical';
            } else if (record.fuel_status === 'Low') {
                statusClass = 'status-low';
            } else {
                statusClass = 'status-good';
            }

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${record.generator_start_time}</td>
                <td>${record.fuel_level_before}%</td>
                <td>${record.generator_stop_time}</td>
                <td>${record.fuel_level_after}%</td>
                <td>${record.run_duration}</td>
                <td>${record.security_assistant_name}</td>
                <td class="${statusClass}">${record.fuel_status}</td>
            `;
            
            blackoutTableBody.appendChild(row);
        });
    }

    function updateHomeBlackoutData(data) {
        // Only proceed if the home blackout table body exists
        if (!homeBlackoutTableBody) return;
        
        // Clear existing data
        homeBlackoutTableBody.innerHTML = '';

        // Take only the most recent 2 records for display in home section
        const recentData = data.slice(0, 2);

        // Check if there's no data
        if (recentData.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `<td colspan="3" class="no-data">No power blackout records found</td>`;
            homeBlackoutTableBody.appendChild(noDataRow);
            return;
        }

        // Add each record to the home table
        recentData.forEach(record => {
            const row = document.createElement('tr');
            
            // Format date for display
            const dateObj = new Date(record.date);
            const formattedDate = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            
            // Calculate duration in more readable format
            const [hours, minutes] = record.run_duration.split(':');
            const formattedDuration = `${hours}h ${minutes}m`;
            
            // Calculate fuel used
            const fuelUsed = record.fuel_used || (record.fuel_level_before - record.fuel_level_after);
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${formattedDuration}</td>
                <td>${fuelUsed} liters</td>
            `;
            
            homeBlackoutTableBody.appendChild(row);
        });
    }

    function updateBlackoutCounters(data) {
        // Update the power blackout counter in home section
        if (homePowerBlackoutCount) {
            // Filter for current month only
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            
            const currentMonthData = data.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
            });
            
            // Update the count
            homePowerBlackoutCount.innerHTML = `${currentMonthData.length} <small class="text-muted">(This Month)</small>`;
        }
    }

    function searchBlackoutRecords() {
        const searchTerm = blackoutSearchInput.value.toLowerCase();
        
        fetch('/api/power-blackouts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Filter data based on search term
                const filteredData = data.filter(record => {
                    const dateObj = new Date(record.date);
                    const formattedDate = dateObj.toLocaleDateString('en-GB');
                    
                    return (
                        formattedDate.toLowerCase().includes(searchTerm) ||
                        record.generator_start_time.toLowerCase().includes(searchTerm) ||
                        record.generator_stop_time.toLowerCase().includes(searchTerm) ||
                        record.security_assistant_name.toLowerCase().includes(searchTerm) ||
                        record.fuel_status.toLowerCase().includes(searchTerm) ||
                        record.run_duration.toLowerCase().includes(searchTerm) ||
                        record.fuel_level_before.toString().includes(searchTerm) ||
                        record.fuel_level_after.toString().includes(searchTerm)
                    );
                });
                
                displayBlackoutData(filteredData);
            })
            .catch(error => {
                console.error('Error searching power blackout records:', error);
                alert('Failed to search power blackout records. Please try again.');
            });
    }

    function exportBlackoutData() {
        fetch('/api/power-blackouts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Format data for export
                const csvData = convertToCSV(data);
                downloadCSV(csvData, 'power_blackout_records.csv');
            })
            .catch(error => {
                console.error('Error exporting power blackout records:', error);
                alert('Failed to export power blackout records. Please try again.');
            });
    }

    function convertToCSV(data) {
        // CSV header
        const csvRows = ['Date,Generator Start Time,Fuel Level Before (%),Generator Stop Time,Fuel Level After (%),Run Duration,Security Assistant,Fuel Status'];
        
        // Format each row
        data.forEach(record => {
            const dateObj = new Date(record.date);
            const formattedDate = dateObj.toLocaleDateString('en-GB');
            
            const row = [
                formattedDate,
                record.generator_start_time,
                record.fuel_level_before,
                record.generator_stop_time,
                record.fuel_level_after,
                record.run_duration,
                record.security_assistant_name,
                record.fuel_status
            ];
            
            // Escape any commas in the data
            const escapedRow = row.map(field => {
                // If field contains commas, quotes, or newlines, enclose in quotes
                if (field && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
                    // Double up quotes to escape them
                    return `"${field.replace(/"/g, '""')}"`;
                }
                return field;
            });
            
            csvRows.push(escapedRow.join(','));
        });
        
        return csvRows.join('\n');
    }

    function downloadCSV(csvData, filename) {
        // Create a Blob with the CSV data
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        
        // Create a download link
        const link = document.createElement('a');
        
        // Set link properties
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'exported_data.csv';
        link.style.display = 'none';
        
        // Add link to document
        document.body.appendChild(link);
        
        // Trigger click event
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    }

    // Navigation between sections
    document.querySelectorAll('[onclick^="showSection"]').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(sectionId);
        });
    });

    // Show Power Blackout section when the Power Blackout button is clicked
    if (document.getElementById('powerBlackoutBtn')) {
        document.getElementById('powerBlackoutBtn').addEventListener('click', function() {
            // Hide all sections first
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Hide all subsections in the Generator section
            document.querySelectorAll('#generatorSection .sub-section').forEach(subsection => {
                subsection.style.display = 'none';
            });
            
            // Show Generator section and Power Blackout subsection
            document.getElementById('generatorSection').classList.add('active');
            document.getElementById('powerBlackoutSection').style.display = 'block';
        });
    }

    // Function to show a specific section
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            
            // If this is the Power Blackout section, refresh the data
            if (sectionId === 'powerBlackoutSection') {
                loadAllBlackoutData();
            }
        }
    }

    // Create a function to refresh data periodically
    function setupAutoRefresh() {
        // Refresh data every 5 minutes (300000 ms)
        setInterval(loadAllBlackoutData, 300000);
    }

    // Setup auto-refresh of data
    setupAutoRefresh();
    
    // Initial data load
    loadAllBlackoutData();
});

// Add event listeners for real-time updates between sections
document.addEventListener('blackoutDataUpdated', function(e) {
    // This custom event can be dispatched whenever data is updated
    // to ensure all sections are in sync
    loadAllBlackoutData();
});

// Helper function accessible globally
function loadAllBlackoutData() {
    fetch('/api/power-blackouts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update home section blackout data
            updateHomeBlackoutData(data);
            
            // Update blackout count in summary cards
            updateBlackoutCounters(data);
            
            // Update main blackout table if visible
            if (document.getElementById('blackoutTableBody')) {
                displayBlackoutData(data);
            }
        })
        .catch(error => {
            console.error('Error fetching power blackout records:', error);
        });
}

// Helper functions for updating home section
function updateHomeBlackoutData(data) {
    const homeBlackoutTableBody = document.querySelector('#homeSection .card:nth-child(1) table tbody');
    if (!homeBlackoutTableBody) return;
    
    // Clear existing data
    homeBlackoutTableBody.innerHTML = '';

    // Take only the most recent 2 records
    const recentData = data.slice(0, 2);

    // Check if there's no data
    if (recentData.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="3" class="no-data">No power blackout records found</td>`;
        homeBlackoutTableBody.appendChild(noDataRow);
        return;
    }

    // Add each record to the home table
    recentData.forEach(record => {
        const row = document.createElement('tr');
        
        // Format date for display
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
        
        // Calculate duration in more readable format
        const [hours, minutes] = record.run_duration.split(':');
        const formattedDuration = `${hours}h ${minutes}m`;
        
        // Calculate fuel used
        const fuelUsed = record.fuel_used || (record.fuel_level_before - record.fuel_level_after);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${formattedDuration}</td>
            <td>${fuelUsed} liters</td>
        `;
        
        homeBlackoutTableBody.appendChild(row);
    });
}

function updateBlackoutCounters(data) {
    const homePowerBlackoutCount = document.querySelector('.dashboard-summary .col-md-3:nth-child(1) .summary-card p');
    
    if (homePowerBlackoutCount) {
        // Filter for current month only
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const currentMonthData = data.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        });
        
        // Update the count
        homePowerBlackoutCount.innerHTML = `${currentMonthData.length} <small class="text-muted">(This Month)</small>`;
    }
}

function displayBlackoutData(data) {
    const blackoutTableBody = document.getElementById('blackoutTableBody');
    if (!blackoutTableBody) return;
    
    // Clear existing data
    blackoutTableBody.innerHTML = '';

    // Check if there's no data
    if (data.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="8" class="no-data">No power blackout records found</td>`;
        blackoutTableBody.appendChild(noDataRow);
        return;
    }

    // Add each record to the table
    data.forEach(record => {
        const row = document.createElement('tr');
        
        // Format date for display
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
        
        // Apply color based on fuel status
        let statusClass = '';
        if (record.fuel_status === 'Critical') {
            statusClass = 'status-critical';
            //powerBlackOutFuelStatusCell.style.color = 'red';
        } else if (record.fuel_status === 'Low') {
            statusClass = 'status-low';
        } else {
            statusClass = 'status-good';
        }

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.generator_start_time}</td>
            <td>${record.fuel_level_before}%</td>
            <td>${record.generator_stop_time}</td>
            <td>${record.fuel_level_after}%</td>
            <td>${record.run_duration}</td>
            <td>${record.security_assistant_name}</td>
            <td class="${statusClass}">${record.fuel_status}</td>
        `;
        
        blackoutTableBody.appendChild(row);
    });
}