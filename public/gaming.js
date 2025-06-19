document.addEventListener('DOMContentLoaded', () => {
    // Section elements
    const remoteIssuanceSection = document.getElementById('remoteIssuanceSection');
    const gameItemIssuanceSection = document.getElementById('gameItemIssuanceSection');
    
    // Navigation buttons
    const remoteIssuanceBtn = document.getElementById('remoteIssuanceBtn');
    const gamingItemsBtn = document.getElementById('gamingItemsBtn');
    const homeBtn = document.getElementById('homeBtn');
    
    // Remote control buttons
    const issueRemoteBtn = document.getElementById('issueRemoteBtn');
    const issueRemoteModal = document.getElementById('issueRemoteModal');
    const issueRemoteForm = document.getElementById('issueRemoteForm');
    const closeRemoteModal = document.getElementById('closeRemoteModal');
    const remoteHomeBtn = document.getElementById('remoteHomeBtn');
    
    // Game item control buttons
    const issueGameItemBtn = document.getElementById('issueGameItemBtn');
    const issueGameItemModal = document.getElementById('issueGameItemModal');
    const issueGameItemForm = document.getElementById('issueGameItemForm');
    const closeGameItemModal = document.getElementById('closeGameItemModal');
    const gameItemHomeBtn = document.getElementById('gameItemHomeBtn');

    // Return status modal elements
    const returnStatusModal = document.getElementById('returnStatusModal');
    const returnStatusForm = document.getElementById('returnStatusForm');
    
    // Current item being updated
    let currentItemId = null;
    let currentItemType = null;
    
    // Helper function to format date as YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }
    
    // Helper function to capitalize words
    function capitalizeWords(str) {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    // Initialize sections
    function initializeSections() {
        // Check if elements exist before trying to manipulate them
        if (remoteIssuanceSection) remoteIssuanceSection.style.display = 'none';
        if (gameItemIssuanceSection) gameItemIssuanceSection.style.display = 'none';
        
        // Initial load of data if we're on the appropriate page
        if (document.getElementById('remoteTableBody')) {
            loadRemoteRecords();
        }
        
        if (document.getElementById('gameItemTableBody')) {
            loadGameItemRecords();
        }
    }
    
    // Show Remote Issuance Section
    if (remoteIssuanceBtn) {
        remoteIssuanceBtn.addEventListener('click', () => {
            if (remoteIssuanceSection) remoteIssuanceSection.style.display = 'block';
            if (gameItemIssuanceSection) gameItemIssuanceSection.style.display = 'none';
            loadRemoteRecords();
        });
    }
    
    // Show Game Item Issuance Section
    if (gamingItemsBtn) {
        gamingItemsBtn.addEventListener('click', () => {
            if (remoteIssuanceSection) remoteIssuanceSection.style.display = 'none';
            if (gameItemIssuanceSection) gameItemIssuanceSection.style.display = 'block';
            loadGameItemRecords();
        });
    }
    
    // Return to home functionality
    if (remoteHomeBtn) {
        remoteHomeBtn.addEventListener('click', () => {
            if (homeBtn) homeBtn.click();
        });
    }
    
    if (gameItemHomeBtn) {
        gameItemHomeBtn.addEventListener('click', () => {
            if (homeBtn) homeBtn.click();
        });
    }
    
    // Modal Controls
    if (issueRemoteBtn) {
        issueRemoteBtn.addEventListener('click', () => {
            if (issueRemoteModal) issueRemoteModal.style.display = 'block';
        });
    }
    
    if (closeRemoteModal) {
        closeRemoteModal.addEventListener('click', () => {
            if (issueRemoteModal) issueRemoteModal.style.display = 'none';
            if (issueRemoteForm) issueRemoteForm.reset();
        });
    }
    
    if (issueGameItemBtn) {
        issueGameItemBtn.addEventListener('click', () => {
            if (issueGameItemModal) issueGameItemModal.style.display = 'block';
        });
    }
    
    if (closeGameItemModal) {
        closeGameItemModal.addEventListener('click', () => {
            if (issueGameItemModal) issueGameItemModal.style.display = 'none';
            if (issueGameItemForm) issueGameItemForm.reset();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (issueRemoteModal && event.target === issueRemoteModal) {
            issueRemoteModal.style.display = 'none';
            if (issueRemoteForm) issueRemoteForm.reset();
        }
        if (issueGameItemModal && event.target === issueGameItemModal) {
            issueGameItemModal.style.display = 'none';
            if (issueGameItemForm) issueGameItemForm.reset();
        }
        if (returnStatusModal && event.target === returnStatusModal) {
            returnStatusModal.style.display = 'none';
            if (returnStatusForm) returnStatusForm.reset();
        }
    });
    
    // Phone validation code
    const handlePhoneInput = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Ensure starts with 07
        if (value.length >= 2 && !value.startsWith('07')) {
            showNotification('Phone number must start with 07', 'error');
            e.target.value = '07';
            return;
        }
        
        // Strictly limit to 10 digits
        if (value.length > 10) {
            e.target.value = value.slice(0, 10);
            showNotification('Phone number cannot exceed 10 digits', 'error');
            return;
        }
        
        e.target.value = value;
        
        if (value.length < 10) {
            const remaining = 10 - value.length;
            showNotification(`Please enter ${remaining} more digit${remaining === 1 ? '' : 's'}`, 'error');
        }
    };

    const handleKeyDown = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (allowedKeys.includes(e.key)) {
            return;
        }
        if (value.length >= 10 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showNotification('Phone number cannot exceed 10 digits', 'error');
        }
    };

    // Add validation for remote form
    const remoteTelInput = document.querySelector('#issueRemoteForm #telNumber');
    if (remoteTelInput) {
        remoteTelInput.addEventListener('input', handlePhoneInput);
        remoteTelInput.addEventListener('keydown', handleKeyDown);
        remoteTelInput.addEventListener('paste', (e) => {
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const currentValue = e.target.value;
            const combinedValue = (currentValue + pastedText).replace(/\D/g, '');
            
            if (combinedValue.length > 10) {
                e.preventDefault();
                showNotification('Phone number cannot exceed 10 digits', 'error');
            }
        });
    }

    // Add validation for game item form
    const gameItemTelInput = document.querySelector('#issueGameItemForm #telNumber');
    if (gameItemTelInput) {
        gameItemTelInput.addEventListener('input', handlePhoneInput);
        gameItemTelInput.addEventListener('keydown', handleKeyDown);
        gameItemTelInput.addEventListener('paste', (e) => {
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const currentValue = e.target.value;
            const combinedValue = (currentValue + pastedText).replace(/\D/g, '');
            
            if (combinedValue.length > 10) {
                e.preventDefault();
                showNotification('Phone number cannot exceed 10 digits', 'error');
            }
        });
    }

    // Handle Remote Form Submission
    if (issueRemoteForm) {
        issueRemoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const firstName = issueRemoteForm.querySelector('#residentFirstName').value;
            const lastName = issueRemoteForm.querySelector('#residentLastName').value;
            const residentNames = `${firstName} ${lastName}`;
            const roomNumber = issueRemoteForm.querySelector('#roomNumber').value;
            const telNumber = issueRemoteForm.querySelector('#telNumber').value;
            const blockName = issueRemoteForm.querySelector('#blockName').value;
            const remoteType = issueRemoteForm.querySelector('#remoteType').value;
            const securityIssued = issueRemoteForm.querySelector('#securityIssued').value;
            
            // Validate required fields
            if (!firstName || !lastName || !roomNumber || !telNumber || !blockName || !remoteType || !securityIssued) {
                showNotification('All fields are required', 'error');
                return;
            }
            
            const remoteRecord = {
                residentNames,
                roomNumber,
                telNumber,
                blockName,
                remoteType,
                securityIssued,
                dateIssued: formatDate(new Date()),
                status: 'Issued'  // Default status is 'Issued'
            };
            
            fetch('/api/remote-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(remoteRecord)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (issueRemoteModal) issueRemoteModal.style.display = 'none';
                if (issueRemoteForm) issueRemoteForm.reset();
                loadRemoteRecords();
                showNotification('Remote issued successfully', 'success');
            })
            .catch(error => {
                console.error('Error issuing remote:', error);
                showNotification('Failed to issue remote. Please try again.', 'error');
            });
        });
    }
    
    // Handle Game Item Form Submission
    if (issueGameItemForm) {
        issueGameItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const firstName = issueGameItemForm.querySelector('#residentFirstName').value;
            const lastName = issueGameItemForm.querySelector('#residentLastName').value;
            const residentNames = `${firstName} ${lastName}`;
            const roomNumber = issueGameItemForm.querySelector('#roomNumber').value;
            const telNumber = issueGameItemForm.querySelector('#telNumber').value;
            const blockName = issueGameItemForm.querySelector('#blockName').value;
            const gameItem = issueGameItemForm.querySelector('#gameItem').value;
            const statusOut = issueGameItemForm.querySelector('#statusOut').value;
            const securityIssued = issueGameItemForm.querySelector('#securityIssued').value;
            
            // Validate required fields
            if (!firstName || !lastName || !roomNumber || !telNumber || !blockName || !gameItem || !statusOut || !securityIssued) {
                showNotification('All fields are required', 'error');
                return;
            }
            
            const gameItemRecord = {
                residentNames,
                roomNumber,
                telNumber,
                blockName,
                gameItem,
                statusOut,
                securityIssued,
                dateIssued: formatDate(new Date()),
                status: 'Issued'  // Default status is 'Issued'
            };
            
            fetch('/api/gaming-item-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameItemRecord)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (issueGameItemModal) issueGameItemModal.style.display = 'none';
                if (issueGameItemForm) issueGameItemForm.reset();
                loadGameItemRecords();
                showNotification('Game item issued successfully', 'success');
            })
            .catch(error => {
                console.error('Error issuing game item:', error);
                showNotification('Failed to issue game item. Please try again.', 'error');
            });
        });
    }
    
    // Load Remote Records
    function loadRemoteRecords() {
        const tableBody = document.getElementById('remoteTableBody');
        if (!tableBody) {
            console.warn('Remote table body element not found');
            return;
        }
        
        // Show loading indicator
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Loading records...</td></tr>';
        
        fetch('/api/remote-records')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                populateRemoteTable(data);
            } else {
                console.error('Unexpected response format:', data);
                showNotification('Invalid data format received from server', 'error');
                tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Error loading data. Invalid response format.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading remote records:', error);
            showNotification('Failed to load remote records. Please try again.', 'error');
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Error loading data. Please try again.</td></tr>';
        });
    }
    
    // Load Game Item Records
    function loadGameItemRecords() {
        const tableBody = document.getElementById('gameItemTableBody');
        if (!tableBody) {
            console.warn('Game item table body element not found');
            return;
        }
        
        // Show loading indicator
        tableBody.innerHTML = '<tr><td colspan="11" style="text-align:center;">Loading records...</td></tr>';
        
        fetch('/api/gaming-item-records')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                populateGameItemTable(data);
            } else {
                console.error('Unexpected response format:', data);
                showNotification('Invalid data format received from server', 'error');
                tableBody.innerHTML = '<tr><td colspan="11" style="text-align:center;">Error loading data. Invalid response format.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading game item records:', error);
            showNotification('Failed to load game item records. Please try again.', 'error');
            tableBody.innerHTML = '<tr><td colspan="11" style="text-align:center;">Error loading data. Please try again.</td></tr>';
        });
    }
    
    // Populate Remote Table
    function populateRemoteTable(records) {
        const tableBody = document.getElementById('remoteTableBody');
        if (!tableBody) {
            console.warn('Remote table body element not found');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No records found</td></tr>';
            return;
        }
        
        records.forEach(record => {
            const row = document.createElement('tr');
            // If status is 'Issued', display as 'Issued' and make clickable
            const currentStatus = record.status || 'Issued'; // Default to 'Issued' if status is missing
            const statusStyle = getStatusBackgroundColor(currentStatus);
            
            // Capitalize the resident names
            const capitalizedNames = capitalizeWords(record.residentNames);
            const capitalizedBlock = capitalizeWords(record.blockName);
            const capitalizedRemoteType = capitalizeWords(record.remoteType);
            
            const issuedDate = record.dateIssued ? formatDate(record.dateIssued) : formatDate(new Date());
            const returnedDate = record.dateReturned ? formatDate(record.dateReturned) : '-';
            
            row.innerHTML = `
                <td>${capitalizedNames}</td>
                <td>${record.roomNumber}</td>
                <td>${record.telNumber}</td>
                <td>${capitalizedBlock}</td>
                <td>${capitalizedRemoteType}</td>
                <td>${issuedDate}</td>
                <td>${capitalizeWords(record.securityIssued)}</td>
                <td>${returnedDate}</td>
                <td>${record.securityReceived ? capitalizeWords(record.securityReceived) : '-'}</td>
                <td class="status-cell" style="text-align: center;">
                    <div class="status-container" style="display: inline-block;">
                        ${currentStatus === 'Issued' ? 
                            `<button class="return-btn status-badge" data-id="${record.id}" data-type="remote" style="${statusStyle}">Issued</button>` :
                            `<span class="status-badge" style="${statusStyle}">${currentStatus}</span>`
                        }
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        const returnButtons = tableBody.querySelectorAll('.return-btn');
        returnButtons.forEach(button => {
            button.addEventListener('click', handleReturnClick);
        });
    }
    
    // Populate Game Item Table
    function populateGameItemTable(records) {
        const tableBody = document.getElementById('gameItemTableBody');
        if (!tableBody) {
            console.warn('Game item table body element not found');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" style="text-align:center;">No records found</td></tr>';
            return;
        }
        
        records.forEach(record => {
            const row = document.createElement('tr');
            // If status is 'Issued', display as 'Issued' and make clickable
            const currentStatus = record.status || 'Issued'; // Default to 'Issued' if status is missing
            const statusStyle = getStatusBackgroundColor(currentStatus);
            
            // Capitalize the fields
            const capitalizedNames = capitalizeWords(record.residentNames);
            const capitalizedBlock = capitalizeWords(record.blockName);
            const capitalizedGameItem = capitalizeWords(record.gameItem);
            
            const issuedDate = record.dateIssued ? formatDate(record.dateIssued) : formatDate(new Date());
            const returnedDate = record.dateReturned ? formatDate(record.dateReturned) : '-';
            
            row.innerHTML = `
                <td>${capitalizedNames}</td>
                <td>${record.roomNumber}</td>
                <td>${record.telNumber}</td>
                <td>${capitalizedBlock}</td>
                <td>${capitalizedGameItem}</td>
                <td>${capitalizeWords(record.statusOut)}</td>
                <td>${issuedDate}</td>
                <td>${capitalizeWords(record.securityIssued)}</td>
                <td>${returnedDate}</td>
                <td>${record.securityReceived ? capitalizeWords(record.securityReceived) : '-'}</td>
                <td class="status-cell" style="text-align: center;">
                    <div class="status-container" style="display: inline-block;">
                        ${currentStatus === 'Issued' ? 
                            `<button class="return-btn status-badge" data-id="${record.id}" data-type="gameItem" style="${statusStyle}">Issued</button>` :
                            `<span class="status-badge" style="${statusStyle}">${currentStatus}</span>`
                        }
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        const returnButtons = tableBody.querySelectorAll('.return-btn');
        returnButtons.forEach(button => {
            button.addEventListener('click', handleReturnClick);
        });
    }
    
    

    // Add toast notification function
    const showNotification = (message, type) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.minWidth = '250px';
        notification.style.textAlign = 'center';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545';
            notification.style.color = 'white';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = 'black';
        } else if (type === 'info') {
            notification.style.backgroundColor = '#17a2b8';
            notification.style.color = 'white';
        }
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    };

    // Get status background color
    const getStatusBackgroundColor = (status) => {
        let backgroundColor;
        let textColor;
        
        switch(status.toLowerCase()) {
            case 'damaged':
                backgroundColor = 'rgb(255, 193, 6)'; // Yellow
                textColor = 'black';
                break;
            case 'returned':
                backgroundColor = 'rgb(5, 246, 61)'; // Green
                textColor = 'black';
                break;
            case 'lost':
                backgroundColor = 'rgb(253, 0, 0)'; // Red
                textColor = 'white';
                break;
            case 'not returned':
                backgroundColor = 'rgb(188, 69, 0)'; // Brown/Orange
                textColor = 'white';
                break;
            case 'issued':
                backgroundColor = 'rgb(0, 123, 255)'; // Blue
                textColor = 'white';
                break;
            default:
                backgroundColor = '#007bff'; // Default Blue
                textColor = 'white';
        }
        
        return `
            background-color: ${backgroundColor};
            color: ${textColor};
            min-width: 120px;
            display: inline-block;
            text-align: center;
            padding: 5px 15px;
            border-radius: 4px;
            white-space: nowrap;
            border: 1px solid black; 
            font-family: 'Montserrat', sans-serif;
            font-weight: bold;
            cursor: ${status.toLowerCase() === 'issued' ? 'pointer' : 'default'};
            outline: none;
        `;
    };

    // Handle Return Button Click
    function handleReturnClick(e) {
        if (!e.target.dataset.id) {
            console.error('No ID found for item');
            showNotification('Error: Cannot return item without ID', 'error');
            return;
        }
        
        currentItemId = e.target.dataset.id;
        currentItemType = e.target.dataset.type;
        
        if (returnStatusModal) {
            returnStatusModal.style.display = 'block';
        } else {
            console.error('Return status modal not found');
            showNotification('Error: Return status modal not found', 'error');
        }
    }
    
    // Handle Return Status Form Submission
    if (returnStatusForm) {
        returnStatusForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!currentItemId || !currentItemType) {
                showNotification('Error: No item selected for return', 'error');
                return;
            }

            const securityReceived = document.getElementById('securityReceived').value;
            const status = document.getElementById('returnStatus').value;
            
            // Validate inputs
            if (!securityReceived.trim()) {
                showNotification('Security received field is required', 'error');
                return;
            }

            const validStatuses = ['Returned', 'Damaged', 'Lost', 'Not Returned'];
            if (!validStatuses.includes(status)) {
                showNotification('Invalid status selected', 'error');
                return;
            }

            const dateReturned = status === 'Not Returned' ? null : formatDate(new Date());
            
            // Store the item type in a local variable since we'll need it after the update
            const itemType = currentItemType;
            
            // Determine the correct API endpoint based on item type
            const endpoint = itemType === 'remote' ? 
                `/api/remote-records/${currentItemId}/return` :
                `/api/gaming-item-records/${currentItemId}/return`;
            
            fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    securityReceived,
                    status,
                    dateReturned
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (returnStatusModal) returnStatusModal.style.display = 'none';
                if (returnStatusForm) returnStatusForm.reset();
                
                currentItemId = null;
                currentItemType = null;
                
                if (itemType === 'remote') {
                    loadRemoteRecords();
                } else if (itemType === 'gameItem') {
                    loadGameItemRecords();
                }
                
                showNotification(`Item status updated to "${status}" successfully`, 'success');
            })
            .catch(error => {
                console.error('Error updating return status:', error);
                showNotification('Failed to update return status. Please try again.', 'error');
            });
        });
    }
    
    // Initialize system
    initializeSections();
    
    // Add global error handler for fetch operations
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        if (event.reason && event.reason.message) {
            showNotification(`Network error: ${event.reason.message}`, 'error');
        } else {
            showNotification('An unexpected error occurred. Please try again.', 'error');
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
    // Section navigation buttons
    const generatorBtn = document.getElementById('generatorBtn');
    const fireAlarmsBtn = document.getElementById('fireAlarmsBtn');
    const fuelDeliveryBtn = document.getElementById('fuelDeliveryBtn');
    const dailyFuelBtn = document.getElementById('dailyFuelBtn');
    
    // Main sections
    const generatorSection = document.getElementById('generatorSection');
    
    // Subsections
    const fireAlarmsSection = document.getElementById('fireAlarmsSection');
    const fuelDeliverySection = document.getElementById('fuelDeliverySection');
    const dailyFuelSection = document.getElementById('dailyFuelSection');
    
    // Modal elements
    const addFireAlarmModal = document.getElementById('addFireAlarmModal');
    const recordDeliveryModal = document.getElementById('recordDeliveryModal');
    const addFuelLevelModal = document.getElementById('addFuelLevelModal');
    
    // Add buttons
    const addFireAlarmBtn = document.getElementById('addFireAlarmBtn');
    const addDeliveryBtn = document.getElementById('addDeliveryBtn');
    const addFuelLevelBtn = document.getElementById('addFuelLevelBtn');
    
    // Forms
    const fireAlarmForm = document.getElementById('fireAlarmForm');
    const deliveryForm = document.getElementById('deliveryForm');
    const fuelLevelForm = document.getElementById('fuelLevelForm');
    
    // Navigation functionality
    generatorBtn.addEventListener('click', function() {
        // Hide all main sections first
        hideAllSections();
        
        // Mark generator button as active
        setActiveNavButton(generatorBtn);
        
        // Show generator section
        generatorSection.classList.add('active');
        
        // By default, show the first subsection
        hideAllSubSections();
        fireAlarmsSection.style.display = 'block';
    });
    
    // Subsection navigation
    fireAlarmsBtn.addEventListener('click', function() {
        hideAllSubSections();
        fireAlarmsSection.style.display = 'block';
    });
    
    fuelDeliveryBtn.addEventListener('click', function() {
        hideAllSubSections();
        fuelDeliverySection.style.display = 'block';
    });
    
    dailyFuelBtn.addEventListener('click', function() {
        hideAllSubSections();
        dailyFuelSection.style.display = 'block';
    });
    
    // Modal open buttons
    addFireAlarmBtn.addEventListener('click', function() {
        addFireAlarmModal.style.display = 'block';
    });
    
    addDeliveryBtn.addEventListener('click', function() {
        recordDeliveryModal.style.display = 'block';
    });
    
    addFuelLevelBtn.addEventListener('click', function() {
        addFuelLevelModal.style.display = 'block';
    });
    
    // Close modal buttons
    document.querySelectorAll('.modal .cancel-btn').forEach(button => {
        button.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Form submissions
    // 1. Fire Alarm Form
    fireAlarmForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
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
        
        // Send data to API
        submitFireAlarmData(formData);
    });
    
    // 2. Fuel Delivery Form
    deliveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            delivery_date: document.getElementById('deliveryDate').value,
            driver_name: document.getElementById('driverName').value,
            fuel_delivered: document.getElementById('fuelDelivered').value,
            delivery_time: document.getElementById('deliveryTime').value,
            security_assistant: document.getElementById('securityAssistant').value,
            generator_status: document.getElementById('generatorStatus').value
        };
        
        // Send data to API
        submitFuelDeliveryData(formData);
    });
    
    // 3. Daily Fuel Level Form
    fuelLevelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            date: document.getElementById('fuelDate').value,
            time: document.getElementById('time').value,
            fuel_level: document.getElementById('fuelLevel').value,
            security_assistant: document.getElementById('securityAssistantFuel').value
        };
        
        // Send data to API
        submitDailyFuelData(formData);
    });
    
    // Helper functions
    function hideAllSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
    }
    
    function hideAllSubSections() {
        const subsections = document.querySelectorAll('#generatorSection .sub-section');
        subsections.forEach(subsection => {
            subsection.style.display = 'none';
        });
    }
    
    function setActiveNavButton(activeButton) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // API functions
    function submitFireAlarmData(formData) {
        fetch('/api/fire-alarms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // On success
            closeAllModals();
            fireAlarmForm.reset();
            loadFireAlarmData(); // Refresh the table
            showNotification('Fire alarm record added successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to add fire alarm record', 'error');
        });
    }
    
    function submitFuelDeliveryData(formData) {
        fetch('/api/fuel-deliveries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // On success
            closeAllModals();
            deliveryForm.reset();
            loadFuelDeliveryData(); // Refresh the table
            showNotification('Fuel delivery record added successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to add fuel delivery record', 'error');
        });
    }
    
    function submitDailyFuelData(formData) {
        fetch('/api/daily-fuel-levels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // On success
            closeAllModals();
            fuelLevelForm.reset();
            loadDailyFuelData(); // Refresh the table
            showNotification('Daily fuel level record added successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to add daily fuel level record', 'error');
        });
    }
    
    // Data loading functions
    function loadFireAlarmData() {
        fetch('/api/fire-alarms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateFireAlarmTable(data);
        })
        .catch(error => {
            console.error('Error loading fire alarm data:', error);
            showNotification('Failed to load fire alarm data', 'error');
        });
    }
    
    function loadFuelDeliveryData() {
        fetch('/api/fuel-deliveries')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateFuelDeliveryTable(data);
        })
        .catch(error => {
            console.error('Error loading fuel delivery data:', error);
            showNotification('Failed to load fuel delivery data', 'error');
        });
    }
    
    function loadDailyFuelData() {
        fetch('/api/daily-fuel-levels')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateDailyFuelTable(data);
        })
        .catch(error => {
            console.error('Error loading daily fuel data:', error);
            showNotification('Failed to load daily fuel data', 'error');
        });
    }
    
    // Table population functions
    function populateFireAlarmTable(data) {
        const tableBody = document.getElementById('fireAlarmTableBody');
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" class="text-center">No records found</td>';
            tableBody.appendChild(row);
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td>${item.time}</td>
                <td>${item.room_number}</td>
                <td>${item.floor}</td>
                <td>${item.triggered_by}</td>
                <td>${item.alarm_level}</td>
                <td>${item.action_taken}</td>
                <td>${item.security_assistant}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    function populateFuelDeliveryTable(data) {
        const tableBody = document.getElementById('deliveryTableBody');
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">No records found</td>';
            tableBody.appendChild(row);
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.delivery_date)}</td>
                <td>${item.driver_name}</td>
                <td>${item.fuel_delivered}</td>
                <td>${item.delivery_time}</td>
                <td>${item.security_assistant}</td>
                <td>${item.generator_status}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    function populateDailyFuelTable(data) {
        const tableBody = document.getElementById('fuelLevelTableBody');
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">No records found</td>';
            tableBody.appendChild(row);
            return;
        }
        
        data.forEach(item => {
            // Calculate fuel status
            let fuelStatus = "Normal";
            if (item.fuel_level < 30) {
                fuelStatus = "Low";
            } else if (item.fuel_level < 15) {
                fuelStatus = "Critical";
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td>${item.time}</td>
                <td>${item.fuel_level}%</td>
                <td>${item.security_assistant}</td>
                <td>${fuelStatus}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Utility functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Append to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Initialize by loading data for each section
    loadFireAlarmData();
    loadFuelDeliveryData();
    loadDailyFuelData();
});

// Generator section functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Generator Section Buttons
    const generatorBtn = document.getElementById('generatorBtn');
    const fireAlarmsBtn = document.getElementById('fireAlarmsBtn');
    const powerBlackoutBtn = document.getElementById('powerBlackoutBtn');
    const fuelDeliveryBtn = document.getElementById('fuelDeliveryBtn');
    const dailyFuelBtn = document.getElementById('dailyFuelBtn');
    const fuelTopUpBtn = document.getElementById('fuelTopUpBtn');

    // DOM Elements - Generator Subsections
    const generatorSection = document.getElementById('generatorSection');
    const fireAlarmsSection = document.getElementById('fireAlarmsSection');
    const powerBlackoutSection = document.getElementById('powerBlackoutSection');
    const fuelDeliverySection = document.getElementById('fuelDeliverySection');
    const dailyFuelSection = document.getElementById('dailyFuelSection');
    const fuelTopUpSection = document.getElementById('fuelTopUpSection');

    // DOM Elements - Add Buttons
    const addFireAlarmBtn = document.getElementById('addFireAlarmBtn');
    const addBlackoutBtn = document.getElementById('addBlackoutBtn');
    const addDeliveryBtn = document.getElementById('addDeliveryBtn');
    const addFuelLevelBtn = document.getElementById('addFuelLevelBtn');
    const addTopUpBtn = document.getElementById('addTopUpBtn');

    // DOM Elements - Modals
    const addFireAlarmModal = document.getElementById('addFireAlarmModal');
    const addBlackoutModal = document.getElementById('addBlackoutModal');
    const recordDeliveryModal = document.getElementById('recordDeliveryModal');
    const addFuelLevelModal = document.getElementById('addFuelLevelModal');
    const fuelTopUpModal = document.getElementById('fuelTopUpModal');

    // DOM Elements - Forms
    const fireAlarmForm = document.getElementById('fireAlarmForm');
    const blackoutForm = document.getElementById('blackoutForm');
    const deliveryForm = document.getElementById('deliveryForm');
    const fuelLevelForm = document.getElementById('fuelLevelForm');
    const fuelTopUpForm = document.getElementById('fuelTopUpForm');

    // DOM Elements - Table Bodies
    const fireAlarmTableBody = document.getElementById('fireAlarmTableBody');
    const blackoutTableBody = document.getElementById('blackoutTableBody');
    const deliveryTableBody = document.getElementById('deliveryTableBody');
    const fuelLevelTableBody = document.getElementById('fuelLevelTableBody');
    const fuelTopUpTableBody = document.getElementById('fuelTopUpTableBody');

    // Show Generator Section
    generatorBtn.addEventListener('click', function() {
        hideAllSections();
        generatorSection.classList.add('active');
        generatorBtn.classList.add('active');
        // Default to showing Fire Alarms subsection when Generator section is opened
        showGeneratorSubsection(fireAlarmsSection);
        loadFireAlarms();
    });

    // Generator Subsection Navigation
    fireAlarmsBtn.addEventListener('click', function() {
        showGeneratorSubsection(fireAlarmsSection);
        loadFireAlarms();
    });

    powerBlackoutBtn.addEventListener('click', function() {
        showGeneratorSubsection(powerBlackoutSection);
        loadBlackouts();
    });

    fuelDeliveryBtn.addEventListener('click', function() {
        showGeneratorSubsection(fuelDeliverySection);
        loadFuelDeliveries();
    });

    dailyFuelBtn.addEventListener('click', function() {
        showGeneratorSubsection(dailyFuelSection);
        loadDailyFuelLevels();
    });

    fuelTopUpBtn.addEventListener('click', function() {
        showGeneratorSubsection(fuelTopUpSection);
        loadFuelTopUps();
    });

    // Helper function to show the correct generator subsection
    function showGeneratorSubsection(subsection) {
        // Hide all subsections
        fireAlarmsSection.style.display = 'none';
        powerBlackoutSection.style.display = 'none';
        fuelDeliverySection.style.display = 'none';
        dailyFuelSection.style.display = 'none';
        fuelTopUpSection.style.display = 'none';

        // Show the selected subsection
        subsection.style.display = 'block';
    }

    // Open Modals
    addFireAlarmBtn.addEventListener('click', function() {
        openModal(addFireAlarmModal);
        resetForm(fireAlarmForm);
    });

    addBlackoutBtn.addEventListener('click', function() {
        openModal(addBlackoutModal);
        resetForm(blackoutForm);
    });

    addDeliveryBtn.addEventListener('click', function() {
        openModal(recordDeliveryModal);
        resetForm(deliveryForm);
    });

    addFuelLevelBtn.addEventListener('click', function() {
        openModal(addFuelLevelModal);
        resetForm(fuelLevelForm);
    });

    addTopUpBtn.addEventListener('click', function() {
        openModal(fuelTopUpModal);
        resetForm(fuelTopUpForm);
    });

    // Close Modals (attach to all cancel buttons)
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });

    // Also close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Helper function to open a modal
    function openModal(modal) {
        modal.style.display = 'block';
    }

    // Helper function to close all modals
    function closeAllModals() {
        addFireAlarmModal.style.display = 'none';
        addBlackoutModal.style.display = 'none';
        recordDeliveryModal.style.display = 'none';
        addFuelLevelModal.style.display = 'none';
        fuelTopUpModal.style.display = 'none';
    }

    // Helper function to reset a form
    function resetForm(form) {
        form.reset();
    }

    // Helper function to hide all main sections
    function hideAllSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Also remove active class from all main nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // ===== FORM SUBMISSIONS =====

    // 1. Fire Alarm Form Submission
    fireAlarmForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fireAlarmData = {
            date: document.getElementById('Date').value,
            time: document.getElementById('time').value,
            room_number: document.getElementById('room_number').value,
            floor: document.getElementById('floor').value,
            triggered_by: document.getElementById('triggered_by').value,
            alarm_level: document.getElementById('alarm_level').value,
            action_taken: document.getElementById('action_taken').value,
            security_assistant: document.getElementById('security_assistant').value
        };

        // Send data to API
        fetch('/api/fire-alarms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fireAlarmData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal and refresh data
            closeAllModals();
            loadFireAlarms();
            showNotification('Fire alarm record added successfully.');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding fire alarm record.', 'error');
        });
    });

    // 2. Power Blackout Form Submission
    blackoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Calculate duration based on start and stop times
        const startTime = document.getElementById('generatorStartTime').value;
        const stopTime = document.getElementById('generatorStopTime').value;
        
        // Convert to Date objects for calculation
        const startDate = new Date(`2000-01-01T${startTime}`);
        const stopDate = new Date(`2000-01-01T${stopTime}`);
        
        // If stopTime is earlier than startTime, assume it's the next day
        if (stopDate < startDate) {
            stopDate.setDate(stopDate.getDate() + 1);
        }
        
        // Calculate the difference in milliseconds
        const durationMs = stopDate - startDate;
        
        // Convert to hours, minutes, seconds
        const hours = Math.floor(durationMs / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000).toString().padStart(2, '0');
        
        const duration = `${hours}:${minutes}:${seconds}`;
        
        // Determine fuel status based on levels
        const fuelBefore = parseInt(document.getElementById('fuelLevelBefore').value);
        const fuelAfter = parseInt(document.getElementById('fuelLevelAfter').value);
        let fuelStatus = "Normal";
        
        if (fuelAfter < 20) {
            fuelStatus = "Low";
        } else if (fuelBefore - fuelAfter > 30) {
            fuelStatus = "High Consumption";
        }
        
        const blackoutData = {
            date: document.getElementById('blackoutDate').value,
            generator_start_time: document.getElementById('generatorStartTime').value,
            fuel_level_before: document.getElementById('fuelLevelBefore').value,
            generator_stop_time: document.getElementById('generatorStopTime').value,
            fuel_level_after: document.getElementById('fuelLevelAfter').value,
            run_duration: duration,
            security_assistant_name: document.getElementById('securityAssistantName').value,
            fuel_status: fuelStatus
        };

        // Send data to API
        fetch('/api/power-blackouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blackoutData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal and refresh data
            closeAllModals();
            loadBlackouts();
            showNotification('Power blackout record added successfully.');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding power blackout record.', 'error');
        });
    });

    // 3. Fuel Delivery Form Submission
    deliveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const deliveryData = {
            delivery_date: document.getElementById('deliveryDate').value,
            driver_name: document.getElementById('driverName').value,
            fuel_delivered: document.getElementById('fuelDelivered').value,
            delivery_time: document.getElementById('deliveryTime').value,
            security_assistant_name: document.getElementById('securityAssistant').value,
            generator_running_status: document.getElementById('generatorStatus').value
        };

        // Send data to API
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
            // Close modal and refresh data
            closeAllModals();
            loadFuelDeliveries();
            showNotification('Fuel delivery record added successfully.');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding fuel delivery record.', 'error');
        });
    });

    // 4. Daily Fuel Level Form Submission
    fuelLevelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Determine fuel status based on level
        const fuelLevel = parseInt(document.getElementById('fuelLevel').value);
        let fuelStatus = "Normal";
        
        if (fuelLevel < 20) {
            fuelStatus = "Low";
        } else if (fuelLevel > 80) {
            fuelStatus = "High";
        }
        
        const fuelLevelData = {
            date: document.getElementById('fuelDate').value,
            time: document.getElementById('time').value,
            fuel_level: document.getElementById('fuelLevel').value,
            security_assistant: document.getElementById('securityAssistantFuel').value,
            fuel_status: fuelStatus
        };

        // Send data to API
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
            // Close modal and refresh data
            closeAllModals();
            loadDailyFuelLevels();
            showNotification('Daily fuel level record added successfully.');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding daily fuel level record.', 'error');
        });
    });

    // 5. Fuel Top-Up Form Submission
    fuelTopUpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get current date and time
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
        
        // Determine fuel status based on final level
        const finalLevel = parseInt(document.getElementById('finalFuelLevel').value);
        let fuelStatus = "Normal";
        
        if (finalLevel < 50) {
            fuelStatus = "Needs More";
        } else if (finalLevel > 80) {
            fuelStatus = "Full";
        }
        
        const topUpData = {
            date: date,
            time: time,
            initial_fuel_level: document.getElementById('initialFuelLevel').value,
            fuel_added: document.getElementById('fuelAdded').value,
            final_fuel_level: document.getElementById('finalFuelLevel').value,
            security_assistant: document.getElementById('securityAssistant').value,
            fuel_status: fuelStatus
        };

        // Send data to API
        fetch('/api/fuel-top-ups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(topUpData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal and refresh data
            closeAllModals();
            loadFuelTopUps();
            showNotification('Fuel top-up record added successfully.');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding fuel top-up record.', 'error');
        });
    });

    // ===== DATA LOADING FUNCTIONS =====

    // 1. Load Fire Alarms
    function loadFireAlarms() {
        // Clear existing data
        fireAlarmTableBody.innerHTML = '';
        
        // Fetch data from API
        fetch('/api/fire-alarms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(alarm => {
                const row = document.createElement('tr');
                
                // Format the date
                const formattedDate = new Date(alarm.date).toLocaleDateString();
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${alarm.time}</td>
                    <td>${alarm.room_number}</td>
                    <td>${alarm.floor}</td>
                    <td>${alarm.triggered_by}</td>
                    <td>${alarm.alarm_level}</td>
                    <td>${alarm.action_taken}</td>
                    <td>${alarm.security_assistant}</td>
                `;
                
                fireAlarmTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading fire alarms:', error);
            showNotification('Error loading fire alarm data.', 'error');
        });
    }

    // 2. Load Power Blackouts
    function loadBlackouts() {
        // Clear existing data
        blackoutTableBody.innerHTML = '';
        
        // Fetch data from API
        fetch('/api/power-blackouts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(blackout => {
                const row = document.createElement('tr');
                
                // Format the date
                const formattedDate = new Date(blackout.date).toLocaleDateString();
                
                // Apply color coding based on fuel status
                let statusClass = '';
                if (blackout.fuel_status === 'Low') {
                    statusClass = 'status-low';
                } else if (blackout.fuel_status === 'High Consumption') {
                    statusClass = 'status-warning';
                }
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${blackout.generator_start_time}</td>
                    <td>${blackout.fuel_level_before}%</td>
                    <td>${blackout.generator_stop_time}</td>
                    <td>${blackout.fuel_level_after}%</td>
                    <td>${blackout.run_duration}</td>
                    <td>${blackout.security_assistant_name}</td>
                    <td class="${statusClass}">${blackout.fuel_status}</td>
                `;
                
                blackoutTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading blackouts:', error);
            showNotification('Error loading power blackout data.', 'error');
        });
    }

    // 3. Load Fuel Deliveries
    function loadFuelDeliveries() {
        // Clear existing data
        deliveryTableBody.innerHTML = '';
        
        // Fetch data from API
        fetch('/api/fuel-deliveries')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(delivery => {
                const row = document.createElement('tr');
                
                // Format the date
                const formattedDate = new Date(delivery.delivery_date).toLocaleDateString();
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${delivery.driver_name}</td>
                    <td>${delivery.fuel_delivered}</td>
                    <td>${delivery.delivery_time}</td>
                    <td>${delivery.security_assistant_name}</td>
                    <td>${delivery.generator_running_status}</td>
                `;
                
                deliveryTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading fuel deliveries:', error);
            showNotification('Error loading fuel delivery data.', 'error');
        });
    }

    // 4. Load Daily Fuel Levels
    function loadDailyFuelLevels() {
        // Clear existing data
        fuelLevelTableBody.innerHTML = '';
        
        // Fetch data from API
        fetch('/api/daily-fuel-levels')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(fuelLevel => {
                const row = document.createElement('tr');
                
                // Format the date
                const formattedDate = new Date(fuelLevel.date).toLocaleDateString();
                
                // Apply color coding based on fuel status
                let statusClass = '';
                if (fuelLevel.fuel_status === 'Low') {
                    statusClass = 'status-low';
                } else if (fuelLevel.fuel_status === 'High') {
                    statusClass = 'status-high';
                }
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${fuelLevel.time}</td>
                    <td>${fuelLevel.fuel_level}%</td>
                    <td>${fuelLevel.security_assistant}</td>
                    <td class="${statusClass}">${fuelLevel.fuel_status}</td>
                `;
                
                fuelLevelTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading daily fuel levels:', error);
            showNotification('Error loading daily fuel level data.', 'error');
        });
    }

    // 5. Load Fuel Top-Ups
    function loadFuelTopUps() {
        // Clear existing data
        fuelTopUpTableBody.innerHTML = '';
        
        // Fetch data from API
        fetch('/api/fuel-top-ups')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(topUp => {
                const row = document.createElement('tr');
                
                // Format the date
                const formattedDate = new Date(topUp.date).toLocaleDateString();
                
                // Apply color coding based on fuel status
                let statusClass = '';
                if (topUp.fuel_status === 'Needs More') {
                    statusClass = 'status-warning';
                } else if (topUp.fuel_status === 'Full') {
                    statusClass = 'status-high';
                }
                
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
        })
        .catch(error => {
            console.error('Error loading fuel top-ups:', error);
            showNotification('Error loading fuel top-up data.', 'error');
        });
    }

    // Helper function to show notifications
    function showNotification(message, type = 'success') {
        // Check if a notification container exists, if not create one
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create a new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add notification to container
        notificationContainer.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
                
                // If no more notifications, remove the container
                if (notificationContainer.children.length === 0) {
                    notificationContainer.remove();
                }
            }, 500);
        }, 5000);
    }

    // Initial loading of the default view
    // When the page loads, ensure the home section is shown by default
    if (document.getElementById('homeSection')) {
        document.getElementById('homeSection').classList.add('active');
    }


    // Search functionality for Generator Control section
function initSearchFunctionality() {
    console.log('Initializing search functionality...');
    
    // Add search bar to the Generator Control section
    const generatorSection = document.getElementById('generatorSection');
    if (!generatorSection) {
        console.error('Generator section not found');
        return;
    }
    
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-wrapper">
            <input type="text" id="generatorSearchInput" placeholder="Search across all tables...">
            <button id="generatorSearchBtn">Search</button>
            <select id="generatorSearchFilter">
                <option value="all">All Tables</option>
                <option value="fireAlarms">Fire Alarms</option>
                <option value="powerBlackout">Power Blackouts</option>
                <option value="fuelDelivery">Fuel Deliveries</option>
                <option value="dailyFuel">Daily Fuel Levels</option>
                <option value="fuelTopUp">Fuel Top-Ups</option>
            </select>
        </div>
        <div id="searchResults" class="search-results"></div>
    `;
    
    // Insert search container at the top of the generator section
    generatorSection.insertBefore(searchContainer, generatorSection.firstChild);
    
    // Get search elements
    const searchInput = document.getElementById('generatorSearchInput');
    const searchBtn = document.getElementById('generatorSearchBtn');
    const searchFilter = document.getElementById('generatorSearchFilter');
    const searchResults = document.getElementById('searchResults');
    
    // Add event listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Search function
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedFilter = searchFilter.value;
        
        if (searchTerm === '') {
            searchResults.innerHTML = '<p>Please enter a search term</p>';
            return;
        }
        
        searchResults.innerHTML = '<p>Searching...</p>';
        
        // Determine which tables to search based on filter
        const tablesToSearch = [];
        
        if (selectedFilter === 'all' || selectedFilter === 'fireAlarms') {
            tablesToSearch.push({
                name: 'Fire Alarms',
                endpoint: '/api/fire-alarms',
                fields: ['date', 'time', 'room_number', 'floor', 'triggered_by', 'alarm_level', 'action_taken', 'security_assistant']
            });
        }
        
        if (selectedFilter === 'all' || selectedFilter === 'powerBlackout') {
            tablesToSearch.push({
                name: 'Power Blackouts',
                endpoint: '/api/power-blackouts',
                fields: ['date', 'generator_start_time', 'fuel_level_before', 'generator_stop_time', 'fuel_level_after', 'run_duration', 'security_assistant_name', 'fuel_status']
            });
        }
        
        if (selectedFilter === 'all' || selectedFilter === 'fuelDelivery') {
            tablesToSearch.push({
                name: 'Fuel Deliveries',
                endpoint: '/api/fuel-deliveries',
                fields: ['delivery_date', 'driver_name', 'fuel_delivered', 'delivery_time', 'security_assistant_name', 'generator_running_status']
            });
        }
        
        if (selectedFilter === 'all' || selectedFilter === 'dailyFuel') {
            tablesToSearch.push({
                name: 'Daily Fuel Levels',
                endpoint: '/api/daily-fuel-levels',
                fields: ['date', 'time', 'fuel_level', 'security_assistant', 'fuel_status']
            });
        }
        
        if (selectedFilter === 'all' || selectedFilter === 'fuelTopUp') {
            tablesToSearch.push({
                name: 'Fuel Top-Ups',
                endpoint: '/api/fuel-top-ups',
                fields: ['date', 'time', 'initial_fuel_level', 'fuel_added', 'final_fuel_level', 'security_assistant', 'fuel_status']
            });
        }
        
        // Fetch data from all selected tables
        const searchPromises = tablesToSearch.map(table => {
            return fetch(table.endpoint)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error fetching ${table.name} data`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Search through the table data
                    const filteredData = data.filter(item => {
                        return table.fields.some(field => {
                            if (item[field] !== null && item[field] !== undefined) {
                                return String(item[field]).toLowerCase().includes(searchTerm);
                            }
                            return false;
                        });
                    });
                    
                    return {
                        tableName: table.name,
                        data: filteredData,
                        fields: table.fields
                    };
                })
                .catch(error => {
                    console.error(`Error searching ${table.name}:`, error);
                    return {
                        tableName: table.name,
                        data: [],
                        error: error.message
                    };
                });
        });
        
        // Process all search results
        Promise.all(searchPromises)
            .then(results => {
                displaySearchResults(results, searchTerm);
            })
            .catch(error => {
                console.error('Error during search:', error);
                searchResults.innerHTML = '<p class="error">An error occurred during search</p>';
            });
    }
    
    // Display search results function
    function displaySearchResults(searchResults, searchTerm) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';
        
        // Check if any results were found
        const totalResults = searchResults.reduce((total, result) => total + result.data.length, 0);
        
        if (totalResults === 0) {
            resultsContainer.innerHTML = `<p>No results found for "${searchTerm}"</p>`;
            return;
        }
        
        // Display summary
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'search-summary';
        summaryDiv.innerHTML = `<h3>Found ${totalResults} results for "${searchTerm}"</h3>`;
        resultsContainer.appendChild(summaryDiv);
        
        // Display results for each table that has matches
        searchResults.forEach(result => {
            if (result.data.length > 0) {
                // Create a section for this table's results
                const tableResultsDiv = document.createElement('div');
                tableResultsDiv.className = 'table-results';
                
                // Add table header
                const tableHeader = document.createElement('h4');
                tableHeader.textContent = `${result.tableName} (${result.data.length} results)`;
                tableResultsDiv.appendChild(tableHeader);
                
                // Create results table
                const resultsTable = document.createElement('table');
                resultsTable.className = 'search-results-table';
                
                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                
                // Add headers based on fields
                for (const field of result.fields) {
                    const th = document.createElement('th');
                    th.textContent = formatFieldName(field);
                    headerRow.appendChild(th);
                }
                
                // Add action column for displaying details
                const actionTh = document.createElement('th');
                actionTh.textContent = 'Action';
                headerRow.appendChild(actionTh);
                
                thead.appendChild(headerRow);
                resultsTable.appendChild(thead);
                
                // Create table body
                const tbody = document.createElement('tbody');
                
                // Add rows for each result
                result.data.forEach(item => {
                    const row = document.createElement('tr');
                    
                    // Add cells for each field
                    for (const field of result.fields) {
                        const td = document.createElement('td');
                        
                        // Format date fields
                        if (field.includes('date') && item[field]) {
                            td.textContent = formatDate(item[field]);
                        } 
                        // Format percentage fields
                        else if (field.includes('fuel_level') || field.includes('level_before') || field.includes('level_after')) {
                            td.textContent = item[field] + '%';
                        }
                        // Regular fields
                        else {
                            td.textContent = item[field];
                        }
                        
                        // Highlight the matching text
                        if (td.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                            highlightSearchTerm(td, searchTerm);
                        }
                        
                        row.appendChild(td);
                    }
                    
                    // Add view button
                    const actionTd = document.createElement('td');
                    const viewBtn = document.createElement('button');
                    viewBtn.className = 'view-btn';
                    viewBtn.textContent = 'View';
                    viewBtn.addEventListener('click', () => {
                        // Navigate to the appropriate section and highlight this row
                        navigateToRecord(result.tableName, item);
                    });
                    actionTd.appendChild(viewBtn);
                    row.appendChild(actionTd);
                    
                    tbody.appendChild(row);
                });
                
                resultsTable.appendChild(tbody);
                tableResultsDiv.appendChild(resultsTable);
                resultsContainer.appendChild(tableResultsDiv);
            }
        });
    }
    
    // Helper function to format field names for display
    function formatFieldName(fieldName) {
        // Replace underscores with spaces and capitalize each word
        return fieldName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Helper function to format dates
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    }
    
    // Helper function to highlight search terms in text
    function highlightSearchTerm(element, searchTerm) {
        const originalText = element.textContent;
        const lowerCaseText = originalText.toLowerCase();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        // Find all occurrences of the search term
        const indices = [];
        let startIndex = 0;
        let index;
        
        while ((index = lowerCaseText.indexOf(lowerCaseSearchTerm, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + lowerCaseSearchTerm.length;
        }
        
        // If search term found, highlight all occurrences
        if (indices.length > 0) {
            element.innerHTML = '';
            let lastIndex = 0;
            
            for (let i = 0; i < indices.length; i++) {
                // Add text before the search term
                const beforeMatch = document.createTextNode(originalText.substring(lastIndex, indices[i]));
                element.appendChild(beforeMatch);
                
                // Add the highlighted search term
                const highlight = document.createElement('span');
                highlight.className = 'highlight';
                highlight.textContent = originalText.substring(indices[i], indices[i] + searchTerm.length);
                element.appendChild(highlight);
                
                lastIndex = indices[i] + searchTerm.length;
            }
            
            // Add remaining text after the last match
            if (lastIndex < originalText.length) {
                const afterLastMatch = document.createTextNode(originalText.substring(lastIndex));
                element.appendChild(afterLastMatch);
            }
        }
    }
    
    // Helper function to navigate to the specific record in its section
    function navigateToRecord(tableName, record) {
        // Navigate to the appropriate section
        switch (tableName) {
            case 'Fire Alarms':
                document.getElementById('fireAlarmsBtn').click();
                break;
            case 'Power Blackouts':
                document.getElementById('powerBlackoutBtn').click();
                break;
            case 'Fuel Deliveries':
                document.getElementById('fuelDeliveryBtn').click();
                break;
            case 'Daily Fuel Levels':
                document.getElementById('dailyFuelBtn').click();
                break;
            case 'Fuel Top-Ups':
                document.getElementById('fuelTopUpBtn').click();
                break;
        }
        
        // After a short delay to ensure the section is loaded
        setTimeout(() => {
            // Find the table for this section
            let tableBody;
            switch (tableName) {
                case 'Fire Alarms':
                    tableBody = document.getElementById('fireAlarmTableBody');
                    break;
                case 'Power Blackouts':
                    tableBody = document.getElementById('blackoutTableBody');
                    break;
                case 'Fuel Deliveries':
                    tableBody = document.getElementById('deliveryTableBody');
                    break;
                case 'Daily Fuel Levels':
                    tableBody = document.getElementById('fuelLevelTableBody');
                    break;
                case 'Fuel Top-Ups':
                    tableBody = document.getElementById('fuelTopUpTableBody');
                    break;
            }
            
            if (tableBody) {
                // Try to find the record in the table
                const rows = tableBody.querySelectorAll('tr');
                let foundRow = null;
                
                rows.forEach(row => {
                    let isMatch = true;
                    const cells = row.querySelectorAll('td');
                    
                    // Check if values in important columns match
                    // This is a simplified approach - you might need to adjust based on your actual data
                    if (record.date || record.delivery_date) {
                        const dateString = formatDate(record.date || record.delivery_date);
                        if (!cells[0].textContent.includes(dateString)) {
                            isMatch = false;
                        }
                    }
                    
                    if (record.time && cells[1] && !cells[1].textContent.includes(record.time)) {
                        isMatch = false;
                    }
                    
                    if (isMatch) {
                        foundRow = row;
                    }
                });
                
                if (foundRow) {
                    // Highlight the found row
                    rows.forEach(row => row.classList.remove('highlight-row'));
                    foundRow.classList.add('highlight-row');
                    
                    // Scroll to the row
                    foundRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);
    }
    
    console.log('Search functionality initialized');
}

// Add the CSS styles for the search functionality
function addSearchStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .search-container {
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .search-wrapper {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        #generatorSearchInput {
            flex: 1;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }
        
        #generatorSearchBtn {
            padding: 8px 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        #generatorSearchBtn:hover {
            background-color: #0069d9;
        }
        
        #generatorSearchFilter {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .search-results {
            max-height: 500px;
            overflow-y: auto;
            background-color: white;
            border-radius: 4px;
            padding: 0 15px;
        }
        
        .search-summary {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .table-results {
            margin-bottom: 20px;
        }
        
        .search-results-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .search-results-table th, 
        .search-results-table td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
        }
        
        .search-results-table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        .search-results-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .search-results-table tr:hover {
            background-color: #f0f0f0;
        }
        
        .highlight {
            background-color: yellow;
            font-weight: bold;
        }
        
        .highlight-row {
            background-color: #ffffd0 !important;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }
        
        .view-btn {
            padding: 4px 8px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .view-btn:hover {
            background-color: #218838;
        }
        
        .error {
            color: #dc3545;
        }
    `;
    document.head.appendChild(styleElement);
}

// Initialize search functionality when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add search styles
    addSearchStyles();
    
    // Initialize search functionality after other modules have loaded
    setTimeout(initSearchFunctionality, 500);
    
    // Ensure the generator section is properly initialized before adding search
    const generatorBtn = document.getElementById('generatorBtn');
    if (generatorBtn) {
        generatorBtn.addEventListener('click', function() {
            // If search container doesn't exist when generator section is clicked,
            // initialize it again
            if (!document.querySelector('.search-container')) {
                setTimeout(initSearchFunctionality, 300);
            }
        });
    }
});
});

});