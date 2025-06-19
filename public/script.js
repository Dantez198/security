// DOM Elements - update to include new sections
const elements = {
    // Navigation buttons
    homeBtn: document.getElementById('homeBtn'),
    keyControlBtn: document.getElementById('keyControlBtn'),
    gamingControlBtn: document.getElementById('gamingControlBtn'),
    generatorBtn: document.getElementById('generatorBtn'),  // Added new Generator button
    recordsBtn: document.getElementById('recordsBtn'),      // Added new Records button
    
    // Sections
    homeSection: document.getElementById('homeSection'),
    keyControlSection: document.getElementById('keyControlSection'),
    gamingControlSection: document.getElementById('gamingControlSection'),
    generatorSection: document.getElementById('generatorSection'),  // Added Generator section
    recordsSection: document.getElementById('recordsSection'),      // Added Records section
    
    // Key Control Elements
    keyIssuanceBtn: document.getElementById('keyIssuanceBtn'),
    masterCardControlBtn: document.getElementById('masterCardControlBtn'),
    keyIssuanceSection: document.getElementById('keyIssuanceSection'),
    masterCardSection: document.getElementById('masterCardSection'),
    
    // Generator Sub-sections
    fireAlarmsBtn: document.getElementById('fireAlarmsBtn'),
    powerBlackoutBtn: document.getElementById('powerBlackoutBtn'),
    fuelDeliveryBtn: document.getElementById('fuelDeliveryBtn'),
    dailyFuelBtn: document.getElementById('dailyFuelBtn'),
    fuelTopUpBtn: document.getElementById('fuelTopUpBtn'),
    fireAlarmsSection: document.getElementById('fireAlarmsSection'),
    powerBlackoutSection: document.getElementById('powerBlackoutSection'),
    fuelDeliverySection: document.getElementById('fuelDeliverySection'),
    dailyFuelSection: document.getElementById('dailyFuelSection'),
    fuelTopUpSection: document.getElementById('fuelTopUpSection'),
    
    // Records Sub-sections
    statementsBtn: document.getElementById('statementsBtn'),
    gatepassBtn: document.getElementById('gatepassBtn'),
    patrolReportBtn: document.getElementById('patrolReportBtn'),
    statementsSection: document.getElementById('statementsSection'),
    gatepassSection: document.getElementById('gatepassSection'),
    patrolReportSection: document.getElementById('patrolReportSection'),
    
    // Gaming Control Elements
    remoteIssuanceBtn: document.getElementById('remoteIssuanceBtn'),
    gamingItemsBtn: document.getElementById('gamingItemsBtn'),
    remoteIssuanceSection: document.getElementById('remoteIssuanceSection'),
    gamingItemsSection: document.getElementById('gamingItemsSection'),
    
    // Modals
    issueKeyModal: document.getElementById('issueKeyModal'),
    issueMasterCardModal: document.getElementById('issueMasterCardModal'),
    returnStatusModal: document.getElementById('returnStatusModal'),
    
    // Forms
    issueKeyForm: document.getElementById('issueKeyForm'),
    issueMasterCardForm: document.getElementById('issueMasterCardForm'),
    returnStatusForm: document.getElementById('returnStatusForm')
};

// State management
let currentSection = 'home';
let currentSubSection = null;

// Navigation setup
const setupNavigation = () => {
    console.log('Setting up navigation...');
    
    if (elements.homeBtn) {
        elements.homeBtn.addEventListener('click', () => {
            showSection('home');
            updateActiveNavButton(elements.homeBtn);
            // Update footer visibility
            const footer = document.querySelector('footer');
            if (footer) footer.style.display = 'block';
        });
    }

    if (elements.keyControlBtn) {
        elements.keyControlBtn.addEventListener('click', () => {
            showSection('keyControl');
            updateActiveNavButton(elements.keyControlBtn);
            showSubSection('keyIssuance');
            // Update footer visibility
            const footer = document.querySelector('footer');
            if (footer) footer.style.display = 'none';
        });
    }

    if (elements.gamingControlBtn) {
        elements.gamingControlBtn.addEventListener('click', () => {
            showSection('gamingControl');
            updateActiveNavButton(elements.gamingControlBtn);
            if (elements.remoteIssuanceSection) {
                showSubSection('remoteIssuance');
            }
            // Update footer visibility
            const footer = document.querySelector('footer');
            if (footer) footer.style.display = 'none';
        });
    }
    
    // Add event listener for Generator button
    if (elements.generatorBtn) {
        elements.generatorBtn.addEventListener('click', () => {
            showSection('generator');
            updateActiveNavButton(elements.generatorBtn);
            if (elements.fireAlarmsSection) {
                showSubSection('fireAlarms');
            }
            // Update footer visibility
            const footer = document.querySelector('footer');
            if (footer) footer.style.display = 'none';
        });
    }
    
    // Add event listener for Records button
    if (elements.recordsBtn) {
        elements.recordsBtn.addEventListener('click', () => {
            showSection('records');
            updateActiveNavButton(elements.recordsBtn);
            if (elements.statementsSection) {
                showSubSection('statements');
            }
            // Update footer visibility
            const footer = document.querySelector('footer');
            if (footer) footer.style.display = 'none';
        });
    }
};

// Set up Generator Control subsections
const setupGeneratorControl = () => {
    console.log('Setting up generator control...');
    
    if (elements.fireAlarmsBtn) {
        elements.fireAlarmsBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.fireAlarmsSection) {
                elements.fireAlarmsSection.style.display = 'block';
                currentSubSection = 'fireAlarms';
            }
        });
    }

    if (elements.powerBlackoutBtn) {
        elements.powerBlackoutBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.powerBlackoutSection) {
                elements.powerBlackoutSection.style.display = 'block';
                currentSubSection = 'powerBlackout';
            }
        });
    }
    
    if (elements.fuelDeliveryBtn) {
        elements.fuelDeliveryBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.fuelDeliverySection) {
                elements.fuelDeliverySection.style.display = 'block';
                currentSubSection = 'fuelDelivery';
            }
        });
    }
    
    if (elements.dailyFuelBtn) {
        elements.dailyFuelBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.dailyFuelSection) {
                elements.dailyFuelSection.style.display = 'block';
                currentSubSection = 'dailyFuel';
            }
        });
    }
    
    if (elements.fuelTopUpBtn) {
        elements.fuelTopUpBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.fuelTopUpSection) {
                elements.fuelTopUpSection.style.display = 'block';
                currentSubSection = 'fuelTopUp';
            }
        });
    }
};

// Set up Records subsections
const setupRecordsControl = () => {
    console.log('Setting up records control...');
    
    if (elements.statementsBtn) {
        elements.statementsBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.statementsSection) {
                elements.statementsSection.style.display = 'block';
                currentSubSection = 'statements';
            }
        });
    }

    if (elements.gatepassBtn) {
        elements.gatepassBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.gatepassSection) {
                elements.gatepassSection.style.display = 'block';
                currentSubSection = 'gatepass';
            }
        });
    }
    
    if (elements.patrolReportBtn) {
        elements.patrolReportBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.patrolReportSection) {
                elements.patrolReportSection.style.display = 'block';
                currentSubSection = 'patrolReport';
            }
        });
    }
};

// Set up Gaming Control subsections
const setupGamingControl = () => {
    console.log('Setting up gaming control...');
    
    if (elements.remoteIssuanceBtn) {
        elements.remoteIssuanceBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.remoteIssuanceSection) {
                elements.remoteIssuanceSection.style.display = 'block';
                currentSubSection = 'remoteIssuance';
            }
        });
    }

    if (elements.gamingItemsBtn) {
        elements.gamingItemsBtn.addEventListener('click', () => {
            hideAllSubSections();
            if (elements.gamingItemsSection) {
                elements.gamingItemsSection.style.display = 'block';
                currentSubSection = 'gamingItems';
            }
        });
    }
};

// Update initApp to include the new setup functions
const initAppWithPagination = () => {
    console.log('Initializing application with pagination...');
    
    // Setup UI components
    setupNavigation();
    setupKeyControl();
    setupGamingControl();     // Added gaming control setup
    setupGeneratorControl();  // Added generator control setup
    setupRecordsControl();    // Added records control setup
    setupModals();
    setupForms();
    
    // Add pagination styles
    addPaginationStyles();
    
    // Load initial data (with pagination)
    loadKeyDataWithPagination();
    loadMasterCardDataWithPagination();
    
    // Setup pagination
    setupPagination();
    
    // Setup search with pagination support
    setupSearchWithPagination();
    
    // Manage footer visibility
    manageFooterVisibility();
};





// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Form value retrieval
const getValue = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id '${id}' not found`);
        return '';
    }
    return element.value;
};

// Text formatting
const capitalizeWords = (str) => {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const formatStaffName = (name) => {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const formatPhoneNumber = (number) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber;
};

// Phone number validation
const validateAndFormatPhoneInput = (inputElement) => {
    // Remove any non-digit characters
    let value = inputElement.value.replace(/\D/g, '');
    
    // Ensure the number starts with 07
    if (value.length >= 2 && !value.startsWith('07')) {
        showNotification('Phone number must start with 07', 'error');
        value = '07';
    }
    
    // Limit to 10 digits
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    // Update input value
    inputElement.value = value;
    
    // Show validation message if length is wrong
    if (value.length < 10) {
        const remaining = 10 - value.length;
        showNotification(`Please enter ${remaining} more digit${remaining === 1 ? '' : 's'}`, 'error');
        return false;
    }
    
    return true;
};


// Status styling
const getStatusBackgroundColor = (status) => {
    let backgroundColor;
    switch(status.toLowerCase()) {
        case 'issued':
            backgroundColor = 'rgb(28, 0, 240)'; // Dark blue
            break;
        case 'damaged':
            backgroundColor = 'rgb(255, 193, 6)'; // Yellow
            break;
        case 'returned':
            backgroundColor = 'rgb(5, 246, 61)'; // Green
            break;
        case 'lost':
            backgroundColor = 'rgb(253, 0, 0)'; // Red
            break;
        case 'not returned':
            backgroundColor = 'rgb(222, 148, 95)'; // Dark blue
            break;
        default:
            backgroundColor = '#007bff'; // Blue
    }
    
    // Return a complete style string with fixed width and consistent styling
    return `
        background-color: ${backgroundColor};
        min-width: 120px;
        color: black;
        display: inline-block;
        text-align: center;
        padding: 5px 15px;
        border-radius: 4px;
        white-space: nowrap;
        border: 1px solid black; 
        font-family: 'Montserrat';
        font-weight: bold;
    `;
};

// Form validation
const validateFormFields = () => {
    const requiredFields = ['residentNames', 'roomNo', 'telNumber', 'block', 'keyType', 'securityIssued'];
    requiredFields.forEach(fieldId => {
        if (!document.getElementById(fieldId)) {
            console.error(`Required form field '${fieldId}' not found`);
        }
    });
};

// ==========================================
// UI MANAGEMENT FUNCTIONS
// ==========================================

// Section visibility management
const hideAllSections = () => {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
};

const hideAllSubSections = () => {
    const subSections = document.querySelectorAll('.sub-section');
    subSections.forEach(section => section.style.display = 'none');
};

const showSection = (sectionId) => {
    hideAllSections();
    const section = document.getElementById(`${sectionId}Section`);
    if (section) {
        section.classList.add('active');
        currentSection = sectionId;
    } else {
        console.error(`Section with id '${sectionId}Section' not found`);
    }
};

const showSubSection = (subSectionId) => {
    hideAllSubSections();
    const subSection = document.getElementById(`${subSectionId}Section`);
    if (subSection) {
        subSection.style.display = 'block';
        currentSubSection = subSectionId;
    } else {
        console.error(`SubSection with id '${subSectionId}Section' not found`);
    }
};

const updateActiveNavButton = (activeButton) => {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
};

// Footer visibility management
const manageFooterVisibility = () => {
    const footer = document.querySelector('footer');
    
    if (!footer) {
        console.error('Footer element not found');
        return;
    }

    const updateFooterVisibility = () => {
        footer.style.display = currentSection === 'home' ? 'block' : 'none';
    };

    // Initial setup
    updateFooterVisibility();
};

// Notification system
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
    }
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
};

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ==========================================

// Data loading
const loadKeyData = async () => {
    try {
        const response = await fetch('/api/key-records');
        if (!response.ok) {
            throw new Error('Failed to load key data');
        }
        const data = await response.json();
        updateKeyTable(data);
    } catch (error) {
        console.error('Error loading key data:', error);
        showNotification('Error loading key data', 'error');
    }
};

const loadMasterCardData = async () => {
    try {
        const response = await fetch('/api/mastercards');
        if (!response.ok) {
            throw new Error('Failed to load mastercard data');
        }
        const data = await response.json();
        updateMasterCardTable(data);
    } catch (error) {
        console.error('Error loading mastercard data:', error);
        showNotification('Error loading mastercard data', 'error');
    }
};

// Table update functions
const updateKeyTable = (data) => {
    const tbody = document.getElementById('keyTableBody');
    if (!tbody) {
        console.error('Key table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        const currentStatus = item.status;
        const statusStyle = getStatusBackgroundColor(currentStatus);
        
        try {
            const formattedPhone = formatPhoneNumber(item.telNumber);
            
            row.innerHTML = `
                <td>${item.residentNames}</td>
                <td>${item.roomNo.toUpperCase()}</td>
                <td>${formattedPhone}</td>
                <td>${capitalizeWords(item.block)}</td>
                <td>${capitalizeWords(item.keyType)}</td>
                <td>${new Date(item.dateIssued).toLocaleDateString()}</td>
                <td>${capitalizeWords(item.securityIssued)}</td>
                <td>${item.dateReturned ? new Date(item.dateReturned).toLocaleDateString() : '-'}</td>
                <td>${item.securityReceived ? capitalizeWords(item.securityReceived) : '-'}</td>
                <td class="status-cell" style="text-align: center;">
                    <div class="status-container" style="display: inline-block;">
                        <span class="status-badge" style="${statusStyle}">
                            ${currentStatus === 'Issued' ? 
                                `<a href="#" class="status-link" data-id="${item.id}" data-type="key" style="color: white; text-decoration: none;">${currentStatus}</a>` :
                                currentStatus}
                        </span>
                    </div>
                </td>
            `;
        } catch (error) {
            console.error(`Error formatting row for ${item.residentNames}:`, error);
            showNotification(error.message, 'error');
            return;
        }
        
        tbody.appendChild(row);
    });

    // Add click event listeners for status links
    document.querySelectorAll('.status-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.returnStatusForm) {
                elements.returnStatusForm.dataset.itemId = link.dataset.id;
                elements.returnStatusForm.dataset.itemType = 'key';
                elements.returnStatusModal.style.display = 'block';
            }
        });
    });
};

const updateMasterCardTable = (data) => {
    const tbody = document.getElementById('masterCardTableBody');
    if (!tbody) {
        console.error('MasterCard table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        const currentStatus = item.status;
        const statusStyle = getStatusBackgroundColor(currentStatus);
        
        row.innerHTML = `
            <td>${formatStaffName(item.staffName)}</td>
            <td>${capitalizeWords(item.department)}</td>
            <td>${new Date(item.dateIssued).toLocaleDateString()}</td>
            <td>${capitalizeWords(item.securityIssued)}</td>
            <td>${capitalizeWords(item.masterCardType)}</td>
            <td>${item.dateReturned ? new Date(item.dateReturned).toLocaleDateString() : '-'}</td>
            <td>${item.securityReceived ? capitalizeWords(item.securityReceived) : '-'}</td>
            <td class="status-cell" style="text-align: center;">
                <div class="status-container" style="display: inline-block;">
                    <span class="status-badge" style="${statusStyle}">
                        ${currentStatus === 'Issued' ? 
                            `<a href="#" class="status-link" data-id="${item.id}" data-type="mastercard" style="color: white; text-decoration: none;">${currentStatus}</a>` :
                            currentStatus}
                    </span>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });

    // Add click event listeners for status links
    document.querySelectorAll('.status-link[data-type="mastercard"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.returnStatusForm) {
                elements.returnStatusForm.dataset.itemId = link.dataset.id;
                elements.returnStatusForm.dataset.itemType = 'mastercard';
                elements.returnStatusModal.style.display = 'block';
            }
        });
    });
};

// ==========================================
// EVENT HANDLERS & SETUP FUNCTIONS
// ==========================================

// Navigation setup


// Key Control setup
const setupKeyControl = () => {
    console.log('Setting up key control...');
    
    if (elements.keyIssuanceBtn) {
        elements.keyIssuanceBtn.addEventListener('click', () => {
            hideAllSubSections();
            elements.keyIssuanceSection.style.display = 'block';
            currentSubSection = 'keyIssuance';
        });
    }

    if (elements.masterCardControlBtn) {
        elements.masterCardControlBtn.addEventListener('click', () => {
            hideAllSubSections();
            elements.masterCardSection.style.display = 'block';
            currentSubSection = 'masterCard';
        });
    }

    const issueKeyBtn = document.getElementById('issueKeyBtn');
    if (issueKeyBtn) {
        issueKeyBtn.addEventListener('click', () => {
            if (elements.issueKeyModal) {
                elements.issueKeyModal.style.display = 'block';
            }
        });
    }

    const issueMasterCardBtn = document.getElementById('issueMasterCardBtn');
    if (issueMasterCardBtn) {
        issueMasterCardBtn.addEventListener('click', () => {
            if (elements.issueMasterCardModal) {
                elements.issueMasterCardModal.style.display = 'block';
            }
        });
    }
};

// Modal setup
const setupModals = () => {
    console.log('Setting up modals...');
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Setup cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
};

// Search functionality
const setupSearch = () => {
    console.log('Setting up search...');
    
    ['keySearchInput', 'masterCardSearchInput'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const tableId = id === 'keySearchInput' ? 'keyTableBody' : 'masterCardTableBody';
                const rows = document.querySelectorAll(`#${tableId} tr`);
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    });
};

// Form setup
const setupForms = () => {
    console.log('Setting up forms...');
    
    // Issue Key Form
    if (elements.issueKeyForm) {
        // Phone number validation
        const telNumberInput = document.getElementById('telNumber');
        
        if (telNumberInput) {
            // Add input event listener
            telNumberInput.addEventListener('input', (e) => {
                validateAndFormatPhoneInput(e.target);
            });
            
            // Add keypress event listener to prevent non-numeric input
            telNumberInput.addEventListener('keypress', (e) => {
                if (!/^\d$/.test(e.key) || 
                    (e.target.value.length >= 10 && !e.target.selectionStart)) {
                    e.preventDefault();
                }
            });
            
            // Add paste event listener
            telNumberInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const digits = pastedText.replace(/\D/g, '');
                const value = (telNumberInput.value + digits).slice(0, 10);
                telNumberInput.value = value;
                validateAndFormatPhoneInput(telNumberInput);
            });
        }

        // Form submission handler
        elements.issueKeyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Key form submitted');
            
            try {
                const telNumberInput = document.getElementById('telNumber');
                if (!validateAndFormatPhoneInput(telNumberInput)) {
                    throw new Error('Please enter a valid 10-digit phone number starting with 07');
                }
                
                const formData = {
                    firstName: capitalizeWords(getValue('residentFirstName')),
                    lastName: capitalizeWords(getValue('residentLastName')),
                    residentNames: `${capitalizeWords(getValue('residentFirstName'))} ${capitalizeWords(getValue('residentLastName'))}`,
                    roomNo: getValue('roomNo').toUpperCase(),
                    telNumber: telNumberInput.value,
                    block: getValue('block'),
                    keyType: getValue('keyType'),
                    securityIssued: getValue('securityIssued'),
                    dateIssued: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    status: 'Issued'
                };

                console.log('Submitting key data:', formData);

                const response = await fetch('/api/key-records', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    elements.issueKeyModal.style.display = 'none';
                    elements.issueKeyForm.reset();
                    await loadKeyData();
                    showNotification('Key issued successfully', 'success');
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to issue key');
                }
            } catch (error) {
                console.error('Key issuance error:', error);
                showNotification(error.message || 'Error issuing key', 'error');
            }
        });
    }

    // Issue MasterCard Form
    if (elements.issueMasterCardForm) {
        elements.issueMasterCardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('MasterCard form submitted');
            
            try {
                const formData = {
                    staffName: `${getValue('staffFirstName')} ${getValue('staffLastName')}`,
                    department: getValue('department'),
                    masterCardType: getValue('masterCardType'),
                    securityIssued: getValue('securityIssuedCard'),
                    dateIssued: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    status: 'Issued'
                };

                console.log('Submitting mastercard data:', formData);

                const response = await fetch('/api/mastercards', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    elements.issueMasterCardModal.style.display = 'none';
                    elements.issueMasterCardForm.reset();
                    await loadMasterCardData();
                    showNotification('MasterCard issued successfully', 'success');
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to issue mastercard');
                }
            } catch (error) {
                console.error('MasterCard issuance error:', error);
                showNotification(error.message || 'Error issuing mastercard', 'error');
            }
        });
    }

    // Return Status Form
    if (elements.returnStatusForm) {
        elements.returnStatusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const itemId = elements.returnStatusForm.dataset.itemId;
            const itemType = elements.returnStatusForm.dataset.itemType;
            
            try {
                const formData = {
                    securityReceived: getValue('securityReceived'),
                    status: getValue('returnStatus'),
                    dateReturned: new Date().toISOString().slice(0, 19).replace('T', ' ')
                };

                // Validate the status
                // Validate the status
                const validStatuses = ['Returned', 'Damaged', 'Lost', 'Not Returned'];
                if (!validStatuses.includes(formData.status)) {
                    throw new Error('Invalid status selected');
                }

                // Validate security received field is not empty
                if (!formData.securityReceived.trim()) {
                    throw new Error('Security received field is required');
                }

                const endpoint = itemType === 'key' ? 
                    `/api/key-records/${itemId}/return` : 
                    `/api/mastercards/${itemId}/return`;

                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update return status');
                }

                const result = await response.json();
                elements.returnStatusModal.style.display = 'none';
                elements.returnStatusForm.reset();
                await loadKeyData();
                await loadMasterCardData();
                showNotification('Return status updated successfully', 'success');
            } catch (error) {
                console.error('Return status update error:', error);
                showNotification(error.message || 'Error updating return status', 'error');
            }
        });
    }
};

// Function to update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const dateTimeString = now.toLocaleString(undefined, options);
    document.getElementById('dateTimeDisplay').textContent = dateTimeString;
}

// When the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if the element exists
    const dateTimeElement = document.getElementById('dateTimeDisplay');
    if (dateTimeElement) {
        // Update the time immediately
        updateDateTime();
        // Update time every second
        setInterval(updateDateTime, 1000);
    } else {
        console.error("Date time display element not found!");
    }
});

// ==========================================
// INITIALIZATION
// ==========================================

// Main initialization function
const initApp = () => {
    console.log('Initializing application...');
    
    // Setup UI components
    setupNavigation();
    setupKeyControl();
    setupModals();
    setupForms();
    setupSearch();
    
    // Load initial data
    loadKeyData();
    loadMasterCardData();
    
    // Manage footer visibility
    manageFooterVisibility();
};



// ==========================================
// PAGINATION FUNCTIONALITY
// ==========================================

// Pagination utility functions
const setupPagination = () => {
    console.log('Setting up pagination...');
    
    // Initialize pagination for key table and mastercard table
    initializePagination('keyTableBody', 'keyPagination');
    initializePagination('masterCardTableBody', 'masterCardPagination');
};

const initializePagination = (tableBodyId, paginationContainerId) => {
    const tableBody = document.getElementById(tableBodyId);
    const paginationContainer = document.getElementById(paginationContainerId);
    
    if (!tableBody || !paginationContainer) {
        console.error(`Table body (${tableBodyId}) or pagination container (${paginationContainerId}) not found`);
        return;
    }
    
    // Set default values
    tableBody.dataset.currentPage = '1';
    tableBody.dataset.rowsPerPage = '25';
    
    // Create pagination controls
    createPaginationControls(paginationContainer, tableBodyId);
    
    // Apply initial pagination
    applyPagination(tableBodyId);
};

const createPaginationControls = (container, tableBodyId) => {
    // Clear existing controls
    container.innerHTML = '';
    
    // Create row selector dropdown
    const rowSelectorContainer = document.createElement('div');
    rowSelectorContainer.className = 'rows-selector';
    rowSelectorContainer.innerHTML = `
        <span>Rows per page: </span>
        <select id="${tableBodyId}RowsSelector" class="rows-selector-dropdown">
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
        </select>
    `;
    
    // Create page navigation controls
    const pageNavContainer = document.createElement('div');
    pageNavContainer.className = 'page-navigation';
    pageNavContainer.innerHTML = `
        <button id="${tableBodyId}PrevPage" class="page-nav-btn" disabled>&laquo; Previous</button>
        <span id="${tableBodyId}PageInfo" class="page-info">Page 1 of 1</span>
        <button id="${tableBodyId}NextPage" class="page-nav-btn">Next &raquo;</button>
    `;
    
    // Append controls to container
    container.appendChild(rowSelectorContainer);
    container.appendChild(pageNavContainer);
    
    // Add event listeners
    const rowsSelector = document.getElementById(`${tableBodyId}RowsSelector`);
    const prevPageBtn = document.getElementById(`${tableBodyId}PrevPage`);
    const nextPageBtn = document.getElementById(`${tableBodyId}NextPage`);
    
    rowsSelector.addEventListener('change', (e) => {
        const tableBody = document.getElementById(tableBodyId);
        tableBody.dataset.rowsPerPage = e.target.value;
        tableBody.dataset.currentPage = '1'; // Reset to first page
        applyPagination(tableBodyId);
    });
    
    prevPageBtn.addEventListener('click', () => {
        const tableBody = document.getElementById(tableBodyId);
        const currentPage = parseInt(tableBody.dataset.currentPage);
        if (currentPage > 1) {
            tableBody.dataset.currentPage = (currentPage - 1).toString();
            applyPagination(tableBodyId);
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const tableBody = document.getElementById(tableBodyId);
        const currentPage = parseInt(tableBody.dataset.currentPage);
        const totalPages = calculateTotalPages(tableBodyId);
        if (currentPage < totalPages) {
            tableBody.dataset.currentPage = (currentPage + 1).toString();
            applyPagination(tableBodyId);
        }
    });
};

const calculateTotalPages = (tableBodyId) => {
    const tableBody = document.getElementById(tableBodyId);
    const rowsPerPage = parseInt(tableBody.dataset.rowsPerPage);
    const totalRows = tableBody.querySelectorAll('tr').length;
    return Math.ceil(totalRows / rowsPerPage);
};

const applyPagination = (tableBodyId) => {
    const tableBody = document.getElementById(tableBodyId);
    const currentPage = parseInt(tableBody.dataset.currentPage);
    const rowsPerPage = parseInt(tableBody.dataset.rowsPerPage);
    const totalPages = calculateTotalPages(tableBodyId);
    const rows = tableBody.querySelectorAll('tr');
    
    // Update page info
    const pageInfo = document.getElementById(`${tableBodyId}PageInfo`);
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
    
    // Enable/disable navigation buttons
    const prevPageBtn = document.getElementById(`${tableBodyId}PrevPage`);
    const nextPageBtn = document.getElementById(`${tableBodyId}NextPage`);
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Apply visible rows based on current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    rows.forEach((row, index) => {
        row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });
};

// Update table update functions to apply pagination
const updateKeyTableWithPagination = (data) => {
    updateKeyTable(data);
    applyPagination('keyTableBody');
};

const updateMasterCardTableWithPagination = (data) => {
    updateMasterCardTable(data);
    applyPagination('masterCardTableBody');
};

// Modify the search functionality to reset pagination
const setupSearchWithPagination = () => {
    ['keySearchInput', 'masterCardSearchInput'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const tableId = id === 'keySearchInput' ? 'keyTableBody' : 'masterCardTableBody';
                const tableBody = document.getElementById(tableId);
                const rows = tableBody.querySelectorAll('tr');
                
                // Show/hide rows based on search term
                let visibleRowsCount = 0;
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    const shouldShow = text.includes(searchTerm);
                    row.style.display = shouldShow ? '' : 'none';
                    row.dataset.filtered = shouldShow ? 'visible' : 'hidden';
                    if (shouldShow) visibleRowsCount++;
                });
                
                // Reset pagination
                tableBody.dataset.currentPage = '1';
                
                // Apply pagination to visible rows
                applyPaginationToFilteredRows(tableId);
                
                // Update pagination info
                updatePaginationForFilteredRows(tableId, visibleRowsCount);
            });
        }
    });
};

const applyPaginationToFilteredRows = (tableBodyId) => {
    const tableBody = document.getElementById(tableBodyId);
    const currentPage = parseInt(tableBody.dataset.currentPage);
    const rowsPerPage = parseInt(tableBody.dataset.rowsPerPage);
    const visibleRows = tableBody.querySelectorAll('tr[data-filtered="visible"]');
    
    // Hide all visible rows first
    visibleRows.forEach(row => row.style.display = 'none');
    
    // Show only rows for current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    visibleRows.forEach((row, index) => {
        if (index >= startIndex && index < endIndex) {
            row.style.display = '';
        }
    });
};

const updatePaginationForFilteredRows = (tableBodyId, visibleRowsCount) => {
    const tableBody = document.getElementById(tableBodyId);
    const rowsPerPage = parseInt(tableBody.dataset.rowsPerPage);
    const totalPages = Math.ceil(visibleRowsCount / rowsPerPage) || 1;
    
    // Update page info
    const pageInfo = document.getElementById(`${tableBodyId}PageInfo`);
    if (pageInfo) {
        pageInfo.textContent = `Page 1 of ${totalPages}`;
    }
    
    // Enable/disable navigation buttons
    const prevPageBtn = document.getElementById(`${tableBodyId}PrevPage`);
    const nextPageBtn = document.getElementById(`${tableBodyId}NextPage`);
    
    if (prevPageBtn) {
        prevPageBtn.disabled = true; // First page
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = totalPages <= 1;
    }
};

// Update the loadKeyData and loadMasterCardData functions
const loadKeyDataWithPagination = async () => {
    try {
        const response = await fetch('/api/key-records');
        if (!response.ok) {
            throw new Error('Failed to load key data');
        }
        const data = await response.json();
        updateKeyTableWithPagination(data);
    } catch (error) {
        console.error('Error loading key data:', error);
        showNotification('Error loading key data', 'error');
    }
};

const loadMasterCardDataWithPagination = async () => {
    try {
        const response = await fetch('/api/mastercards');
        if (!response.ok) {
            throw new Error('Failed to load mastercard data');
        }
        const data = await response.json();
        updateMasterCardTableWithPagination(data);
    } catch (error) {
        console.error('Error loading mastercard data:', error);
        showNotification('Error loading mastercard data', 'error');
    }
};

// Add the CSS for pagination
const addPaginationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .pagination-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        
        .rows-selector {
            display: flex;
            align-items: center;
        }
        
        .rows-selector-dropdown {
            margin-left: 10px;
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ccc;
            background-color: #fff;
        }
        
        .page-navigation {
            display: flex;
            align-items: center;
        }
        
        .page-nav-btn {
            padding: 5px 10px;
            margin: 0 5px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .page-nav-btn:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        
        .page-info {
            margin: 0 10px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
};





// Key Status Chart
        const keyStatusCtx = document.getElementById('keyStatusChart').getContext('2d');
        new Chart(keyStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Returned', 'Outstanding', 'Lost'],
                datasets: [{
                    data: [85, 12, 3],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

// Replace the original initApp call with initAppWithPagination
document.addEventListener('DOMContentLoaded', initAppWithPagination);
