document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fuelLevelSection = document.getElementById('dailyFuelSection');
    const addFuelLevelBtn = document.getElementById('addFuelLevelBtn');
    const fuelLevelModal = document.getElementById('addFuelLevelModal');
    const fuelLevelForm = document.getElementById('fuelLevelForm');
    const fuelLevelTable = document.getElementById('fuelLevelTable');
    const fuelLevelTableBody = document.getElementById('fuelLevelTableBody');
    const fuelLevelSearchInput = document.getElementById('fuelLevelSearchInput');
    const fuelLevelSearchBtn = document.getElementById('fuelLevelSearchBtn');
    const exportFuelLevelDataBtn = document.getElementById('exportFuelLevelDataBtn');
    
    // Elements for homepage fuel display
    const homepageFuelLevel = document.querySelector('.dashboard-summary .purple p');
    
    // Cancel button event listener
    fuelLevelModal.querySelector('.cancel-btn').addEventListener('click', () => {
        fuelLevelModal.style.display = 'none';
    });
    
    // Event Listeners
    addFuelLevelBtn.addEventListener('click', openAddFuelLevelModal);
    fuelLevelForm.addEventListener('submit', handleFuelLevelFormSubmit);
    fuelLevelSearchBtn.addEventListener('click', searchFuelLevelRecords);
    exportFuelLevelDataBtn.addEventListener('click', exportFuelLevelData);
    
    // When clicking outside the modal, close it
    window.addEventListener('click', (event) => {
        if (event.target === fuelLevelModal) {
            fuelLevelModal.style.display = 'none';
        }
    });
    
    // Initial data load
    loadFuelLevelData();
    
    // Functions
    function openAddFuelLevelModal() {
        // Autofill today's date and current time
        const now = new Date();
        const dateInput = document.getElementById('fuelDate');
        const timeInput = document.getElementById('time');
        
        // Format date as YYYY-MM-DD
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // Format time as HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        
        dateInput.value = formattedDate;
        timeInput.value = formattedTime;
        
        // Clear other form fields
        document.getElementById('fuelLevel').value = '';
        document.getElementById('securityAssistantFuel').value = '';
        
        // Display the modal
        fuelLevelModal.style.display = 'block';
    }
    
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    function determineFuelStatus(fuelLevel) {
        if (fuelLevel >= 97) {
            return 'Full';
        } else if (fuelLevel >= 60 && fuelLevel <= 96) {
            return 'Average';
        } else {
            return 'Critical';
        }
    }
    
    function handleFuelLevelFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const date = document.getElementById('fuelDate').value;
        const time = document.getElementById('time').value;
        const fuelLevel = parseInt(document.getElementById('fuelLevel').value);
        const securityAssistant = capitalizeFirstLetter(document.getElementById('securityAssistantFuel').value);
        
        // Determine fuel status based on percentage
        const fuelStatus = determineFuelStatus(fuelLevel);
        
        // Create data object to send to server
        const fuelLevelData = {
            date,
            time,
            fuel_level: fuelLevel,
            security_assistant: securityAssistant,
            fuel_status: fuelStatus
        };
        
        // Send data to server
        fetch('/api/daily-fuel-levels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fuelLevelData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Success - close modal and reload data
            fuelLevelModal.style.display = 'none';
            loadFuelLevelData();
            
            // Update homepage fuel level
            updateHomepageFuelLevel(fuelLevel, fuelStatus);
            
            alert('Fuel level record added successfully!');
        })
        .catch(error => {
            console.error('Error adding fuel level record:', error);
            alert('Failed to add fuel level record. Please try again.');
        });
    }
    
    function updateHomepageFuelLevel(fuelLevel, fuelStatus) {
        if (homepageFuelLevel) {
            // Get color based on status
            let statusColor = '';
            if (fuelStatus === 'Full') {
                statusColor = 'green';
            } else if (fuelStatus === 'Average') {
                statusColor = 'yellow';
            } else {
                statusColor = 'red';
            }
            
            // Update the fuel level text on homepage
            homepageFuelLevel.innerHTML = `${fuelLevel}% <small class="text-muted" style="color:${statusColor};">(${fuelStatus})</small>`;
        }
    }
    
    function loadFuelLevelData() {
        // Clear existing table data
        fuelLevelTableBody.innerHTML = '';
        
        // Fetch data from server
        fetch('/api/daily-fuel-levels')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Populate table with data
            data.forEach(record => {
                addFuelLevelToTable(record);
            });
            
            // Update homepage with the most recent fuel level data
            if (data.length > 0) {
                // Sort data by date and time (most recent first)
                data.sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`);
                    const dateB = new Date(`${b.date} ${b.time}`);
                    return dateB - dateA;
                });
                
                // Get the most recent record
                const latestRecord = data[0];
                updateHomepageFuelLevel(latestRecord.fuel_level, latestRecord.fuel_status);
            }
        })
        .catch(error => {
            console.error('Error fetching fuel level data:', error);
            alert('Failed to load fuel level data. Please refresh the page.');
        });
    }
    
    function addFuelLevelToTable(record) {
        const row = document.createElement('tr');
        
        // Format date for display (assuming date is in YYYY-MM-DD format)
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Determine the appropriate CSS class based on fuel status
        let statusClass = '';
        if (record.fuel_status === 'Full') {
            statusClass = 'status-full';
        } else if (record.fuel_status === 'Average') {
            statusClass = 'status-average';
        } else {
            statusClass = 'status-critical';
        }
        
        // Create row content
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.time}</td>
            <td>${record.fuel_level}%</td>
            <td>${record.security_assistant}</td>
            <td class="${statusClass}">${record.fuel_status}</td>
        `;
        
        // Add row to table
        fuelLevelTableBody.appendChild(row);
    }
    
    function searchFuelLevelRecords() {
        const searchTerm = fuelLevelSearchInput.value.toLowerCase();
        
        // Get all rows in the table
        const rows = fuelLevelTableBody.querySelectorAll('tr');
        
        // Filter rows based on search term
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    function exportFuelLevelData() {
        // Fetch all data for export
        fetch('/api/daily-fuel-levels')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Convert data to CSV format
            const csvContent = convertToCSV(data);
            
            // Create a blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            // Create download link
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `daily_fuel_levels_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            // Append to document, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Error exporting fuel level data:', error);
            alert('Failed to export fuel level data. Please try again.');
        });
    }
    
    function convertToCSV(data) {
        // Define CSV headers
        const headers = ['Date', 'Time', 'Fuel Level (%)', 'Security Assistant', 'Fuel Status'];
        
        // Create CSV rows
        const rows = data.map(record => {
            return [
                new Date(record.date).toLocaleDateString(),
                record.time,
                record.fuel_level,
                record.security_assistant,
                record.fuel_status
            ].join(',');
        });
        
        // Combine headers and rows
        return [headers.join(','), ...rows].join('\n');
    }
    
    // Add CSS for fuel status colors
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .status-full {
            color: rgb(0, 255, 34);
            font-weight: bold;
            font-size: 16px;
        }

        .status-average {
            color: rgb(255, 162, 0);
            font-weight: bold;
            font-size: 16px;
        }

        .status-critical {
            color: red;
            font-weight: bold;
            font-size: 16px;
        }

        .status-full,
        .status-average,
        .status-critical {
            padding: 5px 30px;
            margin: 10px;
            border-radius: 5px;
            display: inline-block;
            min-width: 120px;
            text-align: center;
        }
        
        /* Styles for homepage fuel status */
        .dashboard-summary .purple p small[style*="green"] {
            color: rgb(0, 255, 34) !important;
            font-weight: bold;
        }
        
        .dashboard-summary .purple p small[style*="yellow"] {
            color: rgb(255, 162, 0) !important;
            font-weight: bold;
        }
        
        .dashboard-summary .purple p small[style*="red"] {
            color: red !important;
            font-weight: bold;
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Initial check for existing data to update homepage
    fetch('/api/daily-fuel-levels')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.length > 0) {
            // Sort data by date and time (most recent first)
            data.sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`);
                const dateB = new Date(`${b.date} ${b.time}`);
                return dateB - dateA;
            });
            
            // Get the most recent record
            const latestRecord = data[0];
            updateHomepageFuelLevel(latestRecord.fuel_level, latestRecord.fuel_status);
        }
    })
    .catch(error => {
        console.error('Error fetching initial fuel level data:', error);
    });
});