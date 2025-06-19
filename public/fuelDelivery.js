// Fuel Delivery Management Module
document.addEventListener('DOMContentLoaded', function() {
    // Initialization for the fuel delivery subsection
    initFuelDeliverySection();
});

/**
 * Initialize the fuel delivery section with event listeners and data loading
 */
function initFuelDeliverySection() {
    // Elements
    const addDeliveryBtn = document.getElementById('addDeliveryBtn');
    const deliverySearchBtn = document.getElementById('deliverySearchBtn');
    const deliverySearchInput = document.getElementById('deliverySearchInput');
    const exportDeliveryDataBtn = document.getElementById('exportDeliveryDataBtn');
    const recordDeliveryModal = document.getElementById('recordDeliveryModal');
    const deliveryForm = document.getElementById('deliveryForm');
    const cancelBtns = recordDeliveryModal.querySelectorAll('.cancel-btn');
    
    // Event listeners
    addDeliveryBtn.addEventListener('click', openDeliveryModal);
    deliveryForm.addEventListener('submit', handleDeliveryFormSubmit);
    deliverySearchBtn.addEventListener('click', searchDeliveries);
    deliverySearchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchDeliveries();
        }
    });
    exportDeliveryDataBtn.addEventListener('click', exportDeliveryData);
    
    // Close modal event listeners
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', closeDeliveryModal);
    });
    
    // When the user clicks anywhere outside of the modal content, close it
    window.addEventListener('click', function(event) {
        if (event.target === recordDeliveryModal) {
            closeDeliveryModal();
        }
    });
    
    // Load delivery data on initialization
    loadDeliveryData();
}

/**
 * Opens the delivery modal form
 */
function openDeliveryModal() {
    const modal = document.getElementById('recordDeliveryModal');
    const form = document.getElementById('deliveryForm');
    form.reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deliveryDate').value = today;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Closes the delivery modal form
 */
function closeDeliveryModal() {
    const modal = document.getElementById('recordDeliveryModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

/**
 * Handles the submission of the delivery form
 * @param {Event} event - The form submit event
 */
function handleDeliveryFormSubmit(event) {
    event.preventDefault();
    
    // Gather form data
    const deliveryData = {
        delivery_date: document.getElementById('deliveryDate').value,
        driver_name: document.getElementById('driverName').value,
        fuel_delivered: document.getElementById('fuelDelivered').value,
        delivery_time: document.getElementById('deliveryTime').value,
        security_assistant_name: document.getElementById('securityAssistant').value,
        generator_running_status: document.getElementById('generatorStatus').value
    };
    
    // Validate data
    if (!validateDeliveryData(deliveryData)) {
        return;
    }
    
    // Submit data to server
    saveDeliveryData(deliveryData);
}

/**
 * Validates delivery form data
 * @param {Object} data - The delivery data to validate
 * @returns {boolean} - Whether the data is valid
 */
function validateDeliveryData(data) {
    // Check if all fields are filled
    for (const key in data) {
        if (!data[key]) {
            alert(`Please fill in all fields. Missing: ${key.replace('_', ' ')}`);
            return false;
        }
    }
    
    // Validate fuel amount is a positive number
    if (isNaN(data.fuel_delivered) || parseFloat(data.fuel_delivered) <= 0) {
        alert('Fuel delivered must be a positive number');
        return false;
    }
    
    return true;
}

/**
 * Sends delivery data to the server to be saved
 * @param {Object} deliveryData - The delivery data to save
 */
function saveDeliveryData(deliveryData) {
    fetch('/api/fuel-deliveries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(deliveryData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        showToast('Fuel delivery record saved successfully!', 'success');
        closeDeliveryModal();
        loadDeliveryData(); // Refresh the table
    })
    .catch(error => {
        console.error('Error saving fuel delivery record:', error);
        showToast('Failed to save fuel delivery record. Please try again.', 'error');
    });
}

/**
 * Loads delivery data from the server and populates the table
 */
function loadDeliveryData() {
    fetch('/api/fuel-deliveries')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateDeliveryTable(data);
        })
        .catch(error => {
            console.error('Error loading fuel delivery data:', error);
            showToast('Failed to load fuel delivery records', 'error');
        });
}

/**
 * Populates the delivery table with data
 * @param {Array} data - The delivery records to display
 */
function populateDeliveryTable(data) {
    const tableBody = document.getElementById('deliveryTableBody');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="no-data">No fuel delivery records found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    data.forEach(record => {
        const row = document.createElement('tr');
        
        // Format the date
        const deliveryDate = new Date(record.delivery_date).toLocaleDateString();
        
        // Create a status class based on generator status
        const statusClass = record.generator_running_status === 'Running' ? 'status-running' : 'status-not-running';
        
        row.innerHTML = `
            <td>${deliveryDate}</td>
            <td>${record.driver_name}</td>
            <td>${record.fuel_delivered} liters</td>
            <td>${record.delivery_time}</td>
            <td>${record.security_assistant_name}</td>
            <td class="${statusClass}">${record.generator_running_status}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Search functionality for deliveries table
 */
function searchDeliveries() {
    const searchTerm = document.getElementById('deliverySearchInput').value.toLowerCase();
    
    fetch('/api/fuel-deliveries')
        .then(response => response.json())
        .then(data => {
            const filteredData = data.filter(record => {
                return (
                    record.driver_name.toLowerCase().includes(searchTerm) ||
                    record.security_assistant_name.toLowerCase().includes(searchTerm) ||
                    record.delivery_date.includes(searchTerm) ||
                    record.generator_running_status.toLowerCase().includes(searchTerm) ||
                    record.fuel_delivered.toString().includes(searchTerm)
                );
            });
            
            populateDeliveryTable(filteredData);
        })
        .catch(error => {
            console.error('Error searching fuel deliveries:', error);
            showToast('Error searching records', 'error');
        });
}

/**
 * Export delivery data to CSV file
 */
function exportDeliveryData() {
    fetch('/api/fuel-deliveries')
        .then(response => response.json())
        .then(data => {
            // Create CSV content
            const headers = ['Delivery Date', 'Driver Name', 'Fuel Delivered (liters)', 'Delivery Time', 'Security Assistant Name', 'Generator Running Status'];
            let csvContent = headers.join(',') + '\n';
            
            data.forEach(record => {
                const row = [
                    formatDateForExport(record.delivery_date),
                    `"${record.driver_name.replace(/"/g, '""')}"`,
                    `${record.fuel_delivered} liters`,
                    record.delivery_time,
                    `"${record.security_assistant_name.replace(/"/g, '""')}"`,
                    record.generator_running_status
                ];
                csvContent += row.join(',') + '\n';
            });
            
            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `fuel_deliveries_${formatDateForFilename(new Date())}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Error exporting fuel deliveries:', error);
            showToast('Error exporting data', 'error');
        });
}

/**
 * Format date for export (YYYY-MM-DD)
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date
 */
function formatDateForExport(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Format date for filename (YYYYMMDD)
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date
 */
function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS for status colors
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .status-running {
            color: red;
            font-weight: bold;
        }
        .status-not-running {
            color: green;
            font-weight: bold;
        }
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        .toast {
            padding: 12px 20px;
            border-radius: 4px;
            margin-bottom: 10px;
            opacity: 0;
            transition: opacity 0.3s ease;
            color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .toast.show {
            opacity: 1;
        }
        .toast-success {
            background-color: #4CAF50;
        }
        .toast-error {
            background-color: #F44336;
        }
        .toast-warning {
            background-color: #FF9800;
        }
        .toast-info {
            background-color: #2196F3;
        }
    `;
    document.head.appendChild(style);
});

