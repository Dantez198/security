// main.js - Core Functionality for Qwetu/Qejani Security System
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const sections = document.querySelectorAll('.section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const dropdownButtons = document.querySelectorAll('.dropdown-content button');
    const modals = document.querySelectorAll('.modal');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    
    // Date and Time Display
    function updateDateTime() {
        const now = new Date();
        const dateTimeDisplay = document.getElementById('dateTimeDisplay');
        if (dateTimeDisplay) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            dateTimeDisplay.textContent = now.toLocaleDateString('en-US', options);
        }
    }
    
    // Update date/time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Navigation functionality
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the requested section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update active state for navigation buttons
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === sectionId.replace('Section', 'Btn')) {
                btn.classList.add('active');
            }
        });
    }
    
    // Sub-section display functionality
    function showSubSection(subSectionId) {
        // Find parent section first
        const subSection = document.getElementById(subSectionId);
        if (!subSection) return;
        
        const parentSection = subSection.closest('.section');
        if (!parentSection) return;
        
        // Show parent section
        sections.forEach(section => {
            section.classList.remove('active');
        });
        parentSection.classList.add('active');
        
        // Hide all sub-sections in this section
        const subSections = parentSection.querySelectorAll('.sub-section');
        subSections.forEach(sub => {
            sub.style.display = 'none';
        });
        
        // Show this sub-section
        subSection.style.display = 'block';
    }
    
    // Modal functionality
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            // Clear form inputs if there's a form in the modal
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }
    
    function closeAllModals() {
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Generic search functionality
    function setupSearch(searchInputId, searchBtnId, tableId, columnIndices) {
        const searchInput = document.getElementById(searchInputId);
        const searchBtn = document.getElementById(searchBtnId);
        const table = document.getElementById(tableId);
        
        if (!searchInput || !searchBtn || !table) return;
        
        searchBtn.addEventListener('click', function() {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                let match = false;
                columnIndices.forEach(index => {
                    const cell = row.cells[index];
                    if (cell && cell.textContent.toLowerCase().includes(searchTerm)) {
                        match = true;
                    }
                });
                
                row.style.display = match ? '' : 'none';
            });
        });
        
        // Allow searching on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
    
    // Export to CSV functionality
    function exportTableToCSV(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const rows = table.querySelectorAll('tr');
        let csv = [];
        
        for (let i = 0; i < rows.length; i++) {
            const row = [], cols = rows[i].querySelectorAll('td, th');
            
            for (let j = 0; j < cols.length; j++) {
                // Replace any commas in the cell content to avoid CSV issues
                let text = cols[j].textContent.replace(/,/g, ' ');
                // Enclose in quotes to handle other special characters
                row.push('"' + text + '"');
            }
            
            csv.push(row.join(','));
        }
        
        // Create and download the CSV file
        const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Create pagination for tables
    function createPagination(tableId, paginationId, rowsPerPage = 10) {
        const table = document.getElementById(tableId);
        const paginationContainer = document.getElementById(paginationId);
        
        if (!table || !paginationContainer) return;
        
        const rows = table.querySelectorAll('tbody tr');
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        
        // Clear existing pagination
        paginationContainer.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.addEventListener('click', function() {
                // Hide all rows
                rows.forEach(row => row.style.display = 'none');
                
                // Show rows for current page
                const start = (i - 1) * rowsPerPage;
                const end = Math.min(start + rowsPerPage, rows.length);
                
                for (let j = start; j < end; j++) {
                    rows[j].style.display = '';
                }
                
                // Update active button
                const buttons = paginationContainer.querySelectorAll('button');
                buttons.forEach(button => button.classList.remove('active'));
                btn.classList.add('active');
            });
            
            paginationContainer.appendChild(btn);
        }
        
        // Click the first page button by default
        if (totalPages > 0) {
            paginationContainer.querySelector('button').click();
        }
    }
    
    // Duration calculation helper
    function calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        if (end < start) {
            // If end time is on the next day
            end.setDate(end.getDate() + 1);
        }
        
        // Calculate difference in milliseconds
        const diff = end - start;
        
        // Convert to hours, minutes, seconds
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Generate unique ID for new records
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Determine color for fuel status based on percentage
    function getFuelStatusColor(fuelLevel) {
        if (fuelLevel >= 70) return 'green';
        if (fuelLevel >= 40) return 'orange';
        return 'red';
    }
    
    function getFuelStatusText(fuelLevel) {
        if (fuelLevel >= 70) return 'Good';
        if (fuelLevel >= 40) return 'Warning';
        return 'Critical';
    }
    
    // Data management functions
    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    function getFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
    
    // Set up event listeners for navigation
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.id.replace('Btn', 'Section');
            showSection(sectionId);
        });
    });
    
    // Set up event listeners for dropdowns
    dropdownButtons.forEach(button => {
        button.addEventListener('click', function() {
            const subSectionId = this.id.replace('Btn', 'Section');
            showSubSection(subSectionId);
        });
    });
    
    // Set up event listeners for modal close buttons
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking outside the modal content
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Initial display
    showSection('homeSection');
    
    // Make functions available globally
    window.app = {
        showSection,
        showSubSection,
        openModal,
        closeModal,
        closeAllModals,
        setupSearch,
        exportTableToCSV,
        createPagination,
        calculateDuration,
        generateUniqueId,
        getFuelStatusColor,
        getFuelStatusText,
        saveToLocalStorage,
        getFromLocalStorage
    };
});