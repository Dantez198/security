document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const gatepassTableBody = document.getElementById('gatepassTableBody');
    const addGatepassBtn = document.getElementById('addGatepassBtn');
    const addGatepassModal = document.getElementById('addGatepassModal');
    const gatepassForm = document.getElementById('gatepassForm');
    const cancelBtns = addGatepassModal.querySelectorAll('.cancel-btn');
    
    // Items list array to store multiple items
    let itemsList = [];

    // Setup items list functionality
    setupItemsList();

    // Load gatepass data when the section becomes active
    document.getElementById('gatepassBtn').addEventListener('click', function() {
        loadGatepassData();
    });

    // Open modal when Add Gatepass button is clicked
    addGatepassBtn.addEventListener('click', function() {
        addGatepassModal.style.display = 'block';
    });

    // Close modal when Cancel button is clicked
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            addGatepassModal.style.display = 'none';
            gatepassForm.reset();
            resetItemsList();
        });
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === addGatepassModal) {
            addGatepassModal.style.display = 'none';
            gatepassForm.reset();
            resetItemsList();
        }
    });

    // Function to setup items list functionality
    function setupItemsList() {
        const itemsListContainer = document.getElementById('itemsList').parentElement;
        
        // Create a container for the items
        const itemsContainer = document.createElement('div');
        itemsContainer.id = 'itemsListContainer';
        itemsContainer.className = 'items-list-container';
        
        // Create input group
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        
        // Create input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = 'itemInput';
        inputField.placeholder = 'Enter item';
        
        // Create add button
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'add-item-btn';
        addButton.innerHTML = '<i class="fas fa-plus"></i>';
        addButton.addEventListener('click', addItem);
        
        // Create hidden input to store items list as JSON
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'itemsListJson';
        hiddenInput.name = 'itemsListJson';
        
        // Create list to display added items
        const itemsList = document.createElement('ul');
        itemsList.id = 'itemsDisplayList';
        itemsList.className = 'items-display-list';
        
        // Append elements
        inputGroup.appendChild(inputField);
        inputGroup.appendChild(addButton);
        itemsContainer.appendChild(inputGroup);
        itemsContainer.appendChild(itemsList);
        itemsContainer.appendChild(hiddenInput);
        
        // Replace the original input with our new container
        itemsListContainer.replaceChild(itemsContainer, document.getElementById('itemsList'));
    }
    
    // Function to add an item to the list
    function addItem() {
        const itemInput = document.getElementById('itemInput');
        const item = itemInput.value.trim();
        
        if (item) {
            // Add to our array
            itemsList.push(item);
            
            // Update the hidden input
            document.getElementById('itemsListJson').value = JSON.stringify(itemsList);
            
            // Add to display list
            const itemsDisplayList = document.getElementById('itemsDisplayList');
            const li = document.createElement('li');
            
            // Create item text
            const itemText = document.createElement('span');
            itemText.textContent = item;
            
            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-item-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.dataset.index = itemsList.length - 1;
            removeBtn.addEventListener('click', function() {
                removeItem(parseInt(this.dataset.index));
            });
            
            li.appendChild(itemText);
            li.appendChild(removeBtn);
            itemsDisplayList.appendChild(li);
            
            // Clear input
            itemInput.value = '';
        }
    }
    
    // Function to remove an item from the list
    function removeItem(index) {
        // Remove from array
        itemsList.splice(index, 1);
        
        // Update the hidden input
        document.getElementById('itemsListJson').value = JSON.stringify(itemsList);
        
        // Rebuild the display list
        const itemsDisplayList = document.getElementById('itemsDisplayList');
        itemsDisplayList.innerHTML = '';
        
        itemsList.forEach((item, i) => {
            const li = document.createElement('li');
            
            // Create item text
            const itemText = document.createElement('span');
            itemText.textContent = item;
            
            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-item-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.dataset.index = i;
            removeBtn.addEventListener('click', function() {
                removeItem(parseInt(this.dataset.index));
            });
            
            li.appendChild(itemText);
            li.appendChild(removeBtn);
            itemsDisplayList.appendChild(li);
        });
    }
    
    // Function to reset items list
    function resetItemsList() {
        itemsList = [];
        document.getElementById('itemsListJson').value = '';
        document.getElementById('itemsDisplayList').innerHTML = '';
        document.getElementById('itemInput').value = '';
    }

    // Handle form submission
    gatepassForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(gatepassForm);
        formData.append('itemsList', JSON.stringify(itemsList));
        
        // Get time value
        const timeValue = document.getElementById('gatepassTime').value;
        
        // Create base object from form inputs
        const baseData = {
            date: document.getElementById('gatepassDate').value,
            time: timeValue,
            driversName: document.getElementById('driversName').value,
            driversPhone: document.getElementById('driversPhone').value,
            carRegNo: document.getElementById('carRegNo').value || 'N/A',
            relationToHostel: document.getElementById('relationToHostel').value,
            itemsFrom: document.getElementById('itemsFrom').value,
            itemsTo: document.getElementById('itemsTo').value,
            transferReason: document.getElementById('transferReason').value,
            itemsList: itemsList,
            securityName: document.getElementById('securityNameGatepass').value
        };
        
        // Handle file upload separately
        const uploadedGatepass = document.getElementById('gatepassUploadedGatepass').files[0];
        
        try {
            // Create a combined FormData object for submission
            const submitFormData = new FormData();
            
            // Add json data
            submitFormData.append('data', JSON.stringify(baseData));
            
            // Add file if it exists
            if (uploadedGatepass) {
                submitFormData.append('uploadedGatepass', uploadedGatepass);
            }
            
            // Send data to server
            const response = await fetch('api/gatepass', {
                method: 'POST',
                body: submitFormData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            
            // Add the new gatepass to the table
            addGatepassToTable(result);
            
            // Close modal and reset form
            addGatepassModal.style.display = 'none';
            gatepassForm.reset();
            resetItemsList();
            
            // Show success message
            showNotification('Gatepass added successfully!', 'success');
            
        } catch (error) {
            console.error('Error adding gatepass:', error);
            showNotification('Failed to add gatepass. Please try again.', 'error');
        }
    });

    // Function to load gatepass data from API
    async function loadGatepassData() {
        try {
            // Clear existing table data
            gatepassTableBody.innerHTML = '';
            
            // Show loading indicator
            gatepassTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading data...</td></tr>';
            
            const response = await fetch('api/gatepass');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Clear loading indicator
            gatepassTableBody.innerHTML = '';
            
            // Add data to table
            if (data.length === 0) {
                gatepassTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No gatepass records found</td></tr>';
            } else {
                data.forEach(gatepass => {
                    addGatepassToTable(gatepass);
                });
            }
        } catch (error) {
            console.error('Error loading gatepass data:', error);
            gatepassTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load data. Please try again.</td></tr>';
        }
    }

    // Function to add a gatepass entry to the table
    function addGatepassToTable(gatepass) {
        // Create main row
        const mainRow = document.createElement('tr');
        mainRow.className = 'gatepass-row clickable';
        mainRow.dataset.expanded = 'false';
        
        // Format date for display
        const formattedDate = new Date(gatepass.date).toLocaleDateString('en-GB');
        
        // Create date display with time in smaller font
        const dateTimeDisplay = `
            <div class="date-time-container">
                <div class="date-display">${formattedDate}</div>
                <div class="time-display">${gatepass.time || 'N/A'}</div>
            </div>
        `;
        
        // Format items list for display
        let itemsListDisplay = 'N/A';
        if (gatepass.itemsList && gatepass.itemsList.length > 0) {
            const itemsArray = Array.isArray(gatepass.itemsList) 
                ? gatepass.itemsList 
                : JSON.parse(gatepass.itemsList);
                
            if (itemsArray.length > 0) {
                itemsListDisplay = '<ul class="items-bullet-list">';
                itemsArray.forEach(item => {
                    itemsListDisplay += `<li>${item}</li>`;
                });
                itemsListDisplay += '</ul>';
            }
        }
        
        // Format uploaded gatepass display
        let uploadedGatepassDisplay = 'None';
        if (gatepass.uploadedGatepass) {
            // If it's a URL to an image
            if (typeof gatepass.uploadedGatepass === 'string' && 
                (gatepass.uploadedGatepass.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
                uploadedGatepassDisplay = `<img src="${gatepass.uploadedGatepass}" alt="Gatepass" class="gatepass-thumbnail" onclick="openImageModal(this.src, event)">`;
            } else {
                // If it's an object or just a reference
                uploadedGatepassDisplay = `<i class="fas fa-file-alt"></i> <a href="#" onclick="viewGatepass('${gatepass.id || ''}', event)">View</a>`;
            }
        }
        
        // Add content to the main row - only visible columns
        mainRow.innerHTML = `
            <td>${dateTimeDisplay}</td>
            <td>${gatepass.driversName}</td>
            <td>${gatepass.driversPhone}</td>
            <td>${gatepass.itemsFrom}</td>
            <td>${gatepass.itemsTo}</td>
            <td>${gatepass.securityName}</td>
        `;
        
        // Create detail row (initially hidden)
        const detailRow = document.createElement('tr');
        detailRow.className = 'gatepass-detail-row';
        detailRow.style.display = 'none';
        
        // Create cell that spans all columns
        const detailCell = document.createElement('td');
        detailCell.colSpan = 6;
        
        // Create detail content
        detailCell.innerHTML = `
            <div class="gatepass-details">
                <div class="detail-section">
                    <h4>Driver Information</h4>
                    <p><strong>Car Registration:</strong> ${gatepass.carRegNo}</p>
                    <p><strong>Relation to Hostel:</strong> ${gatepass.relationToHostel}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Transfer Information</h4>
                    <p><strong>Transfer Reason:</strong> ${gatepass.transferReason}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Items List</h4>
                    ${itemsListDisplay}
                </div>
                
                <div class="detail-section">
                    <h4>Uploaded Gatepass</h4>
                    <div class="gatepass-upload-preview">
                        ${uploadedGatepassDisplay}
                    </div>
                </div>
            </div>
        `;
        
        detailRow.appendChild(detailCell);
        
        // Add rows to table
        gatepassTableBody.prepend(detailRow);
        gatepassTableBody.prepend(mainRow);
        
        // Add click event to toggle details
        mainRow.addEventListener('click', function() {
            const isExpanded = this.dataset.expanded === 'true';
            
            // Toggle expansion state
            this.dataset.expanded = isExpanded ? 'false' : 'true';
            
            // Apply active class to main row
            if (isExpanded) {
                this.classList.remove('active');
            } else {
                this.classList.add('active');
            }
            
            // Toggle detail row
            detailRow.style.display = isExpanded ? 'none' : 'table-row';
        });
    }

    // Function to show notifications
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
        
        // Hide and remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Enhanced image modal functionality
    if (!document.getElementById('imageModal')) {
        const imageModal = document.createElement('div');
        imageModal.id = 'imageModal';
        imageModal.className = 'image-modal';
        imageModal.innerHTML = `
            <div class="modal-content-wrapper">
                <div class="modal-header">
                    <span class="close-modal">&times;</span>
                    <div class="modal-actions">
                        <button id="downloadImage" class="download-btn">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
                <div class="modal-body">
                    <img id="modalImage" class="modal-content">
                </div>
            </div>
        `;
        document.body.appendChild(imageModal);
        
        // Close modal when clicking the X
        imageModal.querySelector('.close-modal').addEventListener('click', function() {
            imageModal.style.display = 'none';
        });
        
        // Close modal when clicking outside the content
        imageModal.addEventListener('click', function(event) {
            if (event.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });

        // Download button functionality
        document.getElementById('downloadImage').addEventListener('click', function() {
            const imgSrc = document.getElementById('modalImage').src;
            
            // Create a temporary anchor element
            const a = document.createElement('a');
            a.href = imgSrc;
            a.download = 'gatepass-image.jpg'; // Default filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // Initial load if gatepass section is active
    if (document.getElementById('gatepassSection').classList.contains('active')) {
        loadGatepassData();
    }
    
    // Add CSS styles for the new layout
    addStyles();
    
    // Function to add necessary styles
    function addStyles() {
        if (!document.getElementById('gatepassCustomStyles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'gatepassCustomStyles';
            styleElement.textContent = `
                /* Table and Row Styles */
                #gatepassTable {
                    border-collapse: collapse;
                    width: 100%;
                }
                
                .gatepass-row {
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .gatepass-row:hover {
                    background-color: #f5f5f5;
                }
                
                .gatepass-row.active {
                    background-color: #e9f5ff;
                }
                
                .gatepass-row td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                /* Detail Row Styles */
                .gatepass-detail-row td {
                    padding: 0;
                    background-color: #f9f9f9;
                }
                
                .gatepass-details {
                    padding: 20px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                
                .detail-section {
                    margin-bottom: 10px;
                }
                
                .detail-section h4 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    color: #333;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
                
                /* Date Time Display */
                .date-time-container {
                    display: flex;
                    flex-direction: column;
                }
                
                .date-display {
                    font-weight: 500;
                }
                
                .time-display {
                    font-size: 0.85em;
                    color: #666;
                }
                
                /* Items List */
                .items-bullet-list {
                    list-style-type: disc;
                    padding-left: 20px;
                    margin: 0;
                }
                
                .items-bullet-list li {
                    margin-bottom: 5px;
                }
                
                /* Gatepass Image */
                .gatepass-thumbnail {
                    max-width: 100px;
                    max-height: 60px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .gatepass-thumbnail:hover {
                    transform: scale(1.05);
                }
                
                /* Enhanced Modal */
                .image-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgba(0, 0, 0, 0.85);
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                .modal-content-wrapper {
                    position: relative;
                    background-color: #fefefe;
                    margin: auto;
                    max-width: 90%;
                    max-height: 90vh;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    animation: modalFadeIn 0.3s;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    background-color: #f5f5f5;
                    border-bottom: 1px solid #ddd;
                }
                
                .modal-body {
                    padding: 15px;
                    text-align: center;
                    overflow: auto;
                    max-height: calc(90vh - 60px);
                }
                
                
                .close-modal {
                    color: #777;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .close-modal:hover {
                    color: #333;
                }
                
                .download-btn {
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 14px;
                    margin: 4px 2px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background-color 0.3s;
                }
                
                .download-btn:hover {
                    background-color: #45a049;
                }
                
                @keyframes modalFadeIn {
                    from {opacity: 0; transform: translateY(-20px);}
                    to {opacity: 1; transform: translateY(0);}
                }
            `;
            document.head.appendChild(styleElement);
        }
    }
});

// Function to open image modal
function openImageModal(src, event) {
    // Prevent event from bubbling up to row click handler
    if (event) {
        event.stopPropagation();
    }
    
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = src;
}

// Function to view gatepass document
function viewGatepass(id, event) {
    // Prevent event from bubbling up to row click handler
    if (event) {
        event.stopPropagation();
    }
    
    // This would typically open a document viewer or redirect to a page showing the gatepass
    // For now, just show an alert
    alert(`Viewing gatepass with ID: ${id}`);
    
    // Prevent default link behavior
    return false;
}