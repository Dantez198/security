// fuelTopUp.js - Handles all functionality for the Fuel Top Up subsection

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fuelTopUpSection = document.getElementById('fuelTopUpSection');
    const fuelTopUpTable = document.getElementById('fuelTopUpTable');
    const fuelTopUpTableBody = document.getElementById('fuelTopUpTableBody');
    const addTopUpBtn = document.getElementById('addTopUpBtn');
    const fuelTopUpModal = document.getElementById('fuelTopUpModal');
    const fuelTopUpForm = document.getElementById('fuelTopUpForm');
    const topUpSearchInput = document.getElementById('topUpSearchInput');
    const topUpSearchBtn = document.getElementById('topUpSearchBtn');
    const exportTopUpDataBtn = document.getElementById('exportTopUpDataBtn');
    
    // Cancel buttons in modal
    const cancelBtns = fuelTopUpModal.querySelectorAll('.cancel-btn');

    // Initialize
    loadFuelTopUps();

    // Event Listeners
    addTopUpBtn.addEventListener('click', openFuelTopUpModal);
    fuelTopUpForm.addEventListener('submit', handleFuelTopUpSubmit);
    cancelBtns.forEach(btn => btn.addEventListener('click', closeModal));
    topUpSearchBtn.addEventListener('click', searchFuelTopUps);
    exportTopUpDataBtn.addEventListener('click', exportFuelTopUpData);

    // Functions
    function openFuelTopUpModal() {
        // Add date and time fields dynamically if they don't already exist
        if (!document.getElementById('fuelTopUpDate')) {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'form-group';
            dateGroup.innerHTML = `
                <label for="fuelTopUpDate">Date:</label>
                <input type="date" id="fuelTopUpDate" required>
            `;
            fuelTopUpForm.insertBefore(dateGroup, fuelTopUpForm.firstChild);
        }
        
        if (!document.getElementById('fuelTopUpTime')) {
            const timeGroup = document.createElement('div');
            timeGroup.className = 'form-group';
            timeGroup.innerHTML = `
                <label for="fuelTopUpTime">Time:</label>
                <input type="time" id="fuelTopUpTime" required>
            `;
            fuelTopUpForm.insertBefore(timeGroup, fuelTopUpForm.children[1]);
        }
        
        // Set default date to today
        document.getElementById('fuelTopUpDate').valueAsDate = new Date();
        
        // Reset form
        fuelTopUpForm.reset();
        document.getElementById('fuelTopUpDate').valueAsDate = new Date();
        
        // Show modal
        fuelTopUpModal.style.display = 'block';
    }

    function closeModal() {
        fuelTopUpModal.style.display = 'none';
    }

    async function handleFuelTopUpSubmit(e) {
        e.preventDefault();
        
        const date = document.getElementById('fuelTopUpDate').value;
        const time = document.getElementById('fuelTopUpTime').value;
        const initialFuelLevel = parseInt(document.getElementById('initialFuelLevel').value);
        const fuelAdded = parseFloat(document.getElementById('fuelAdded').value);
        const finalFuelLevel = parseInt(document.getElementById('finalFuelLevel').value);
        const securityAssistant = document.getElementById('securityAssistant').value;

        // Add this debugging to see what's being captured
    console.log('Security Assistant value:', securityAssistant);
    
    
        
        // Calculate fuel status
        let fuelStatus = '';
        if (finalFuelLevel > 75) {
            fuelStatus = 'Full';
        } else if (finalFuelLevel > 50) {
            fuelStatus = 'Above Average';
        } else if (finalFuelLevel > 25) {
            fuelStatus = 'Average';
        } else if (finalFuelLevel > 10) {
            fuelStatus = 'Low';
        } else {
            fuelStatus = 'Critical';
        }
        
        try {
            const response = await fetch('/api/fuel-top-ups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date,
                    time,
                    initial_fuel_level: initialFuelLevel,
                    fuel_added: fuelAdded,
                    final_fuel_level: finalFuelLevel,
                    security_assistant: securityAssistant,
                    fuel_status: fuelStatus
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Fuel top-up record added successfully');
                closeModal();
                loadFuelTopUps(); // Refresh the table
            } else {
                throw new Error(data.error || 'Failed to add fuel top-up record');
            }

            
        } catch (error) {
            console.error('Error submitting fuel top-up:', error);
            alert(`Error: ${error.message}`);
        }
    }

    async function loadFuelTopUps() {
        try {
            const response = await fetch('/api/fuel-top-ups');
            const topUps = await response.json();
            
            if (response.ok) {
                displayFuelTopUps(topUps);
            } else {
                throw new Error('Failed to fetch fuel top-up data');
            }
        } catch (error) {
            console.error('Error loading fuel top-ups:', error);
            fuelTopUpTableBody.innerHTML = `<tr><td colspan="7">Error loading data: ${error.message}</td></tr>`;
        }
    }

    function displayFuelTopUps(topUps) {
        fuelTopUpTableBody.innerHTML = '';
        
        if (topUps.length === 0) {
            fuelTopUpTableBody.innerHTML = '<tr><td colspan="7">No fuel top-up records found</td></tr>';
            return;
        }
        
        topUps.forEach(topUp => {
            // Format date for display
            const dateObj = new Date(topUp.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            // Apply color coding based on fuel status
            let statusClass = '';
            switch (topUp.fuel_status) {
                case 'Full':
                    statusClass = 'status-good';
                    break;
                case 'Above Average':
                    statusClass = 'status-good';
                    break;
                case 'Average':
                    statusClass = 'status-warning';
                    break;
                case 'Low':
                    statusClass = 'status-warning';
                    break;
                case 'Critical':
                    statusClass = 'status-critical';
                    break;
                default:
                    statusClass = '';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${topUp.time}</td>
                <td>${topUp.initial_fuel_level}%</td>
                <td>${topUp.fuel_added}</td>
                <td>${topUp.final_fuel_level}%</td>
                <td>${topUp.security_assistant}</td>
                <td class="${statusClass}">${topUp.fuel_status}</td>
            `;
            
            fuelTopUpTableBody.appendChild(row);
        });
    }

    function searchFuelTopUps() {
        const searchValue = topUpSearchInput.value.toLowerCase();
        const rows = fuelTopUpTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchValue) ? '' : 'none';
        });
    }

    function exportFuelTopUpData() {
        try {
            // Get table data
            const table = document.getElementById('fuelTopUpTable');
            
            // Create CSV content
            let csv = [];
            
            // Add header row
            const headerRow = [];
            table.querySelectorAll('thead th').forEach(th => {
                headerRow.push(th.textContent);
            });
            csv.push(headerRow.join(','));
            
            // Add data rows
            table.querySelectorAll('tbody tr').forEach(tr => {
                if (tr.style.display !== 'none') { // Only include visible rows (for filtered results)
                    const dataRow = [];
                    tr.querySelectorAll('td').forEach(td => {
                        // Remove commas to avoid CSV issues
                        dataRow.push(`"${td.textContent.replace(/"/g, '""')}"`);
                    });
                    csv.push(dataRow.join(','));
                }
            });
            
            // Create CSV file
            const csvContent = csv.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `fuel_top_ups_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(a);
            
            // Trigger download
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    // Add event listener for real-time validation of final fuel level
    document.getElementById('finalFuelLevel').addEventListener('input', validateFinalFuelLevel);
    document.getElementById('fuelAdded').addEventListener('input', validateFinalFuelLevel);
    document.getElementById('initialFuelLevel').addEventListener('input', validateFinalFuelLevel);

    function validateFinalFuelLevel() {
        const initialFuelLevel = parseInt(document.getElementById('initialFuelLevel').value) || 0;
        const fuelAdded = parseFloat(document.getElementById('fuelAdded').value) || 0;
        const finalFuelLevel = parseInt(document.getElementById('finalFuelLevel').value) || 0;
        
        // Simple validation - final should be greater than initial when fuel is added
        if (fuelAdded > 0 && finalFuelLevel <= initialFuelLevel) {
            document.getElementById('finalFuelLevel').setCustomValidity('Final fuel level should be higher than initial when fuel is added');
        } else {
            document.getElementById('finalFuelLevel').setCustomValidity('');
        }
    }
});

// Add CSS for status indicators
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for fuel status indicators if not already in the main CSS
    if (!document.getElementById('fuelStatusStyles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'fuelStatusStyles';
        styleEl.textContent = `
            .status-good { 
                color: #2e7d32; 
                font-weight: bold;
            }
            .status-warning { 
                color: #ff8f00; 
                font-weight: bold;
            }
            .status-critical { 
                color: #d32f2f; 
                font-weight: bold;
            }
        `;
        document.head.appendChild(styleEl);
    }
});