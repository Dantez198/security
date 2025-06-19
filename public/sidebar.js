document.addEventListener('DOMContentLoaded', function() {
    // Get sidebar elements
    const sidebar = document.getElementById('mySidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarItems = document.querySelectorAll('.sidebar-item.has-submenu');
    
    // Function to open sidebar
    function openSidebar() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    }
    
    // Function to close sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Toggle sidebar when clicking the toggle button
    sidebarToggleBtn.addEventListener('click', openSidebar);
    
    // Close sidebar when clicking the close button
    closeSidebarBtn.addEventListener('click', closeSidebar);
    
    // Close sidebar when clicking outside (on the overlay)
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Toggle submenu when clicking on sidebar items with dropdown
    sidebarItems.forEach(item => {
        const link = item.querySelector('.sidebar-link');
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if this item is already open
            const isOpen = item.classList.contains('open');
            
            // Close all open submenus
            sidebarItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                }
            });
            
            // Toggle this item
            if (isOpen) {
                item.classList.remove('open');
            } else {
                item.classList.add('open');
            }
        });
    });
    
    // Handle navigation for sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't prevent default for parent menu items with submenus
            if (this.closest('.has-submenu') && this.parentElement.classList.contains('sidebar-item')) {
                return;
            }
            
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target section ID from the link's ID
            const linkId = this.id;
            let targetSectionId;
            
            // Map sidebar link IDs to section IDs
            if (linkId === 'dashboardLink') {
                targetSectionId = 'homeSection';
            } else if (linkId === 'keyIssuanceSidebarLink') {
                targetSectionId = 'keyIssuanceSection';
                showSubSection('keyIssuanceSection', 'keyControlSection');
            } else if (linkId === 'masterCardSidebarLink') {
                targetSectionId = 'masterCardSection';
                showSubSection('masterCardSection', 'keyControlSection');
            } else if (linkId === 'remoteIssuanceSidebarLink') {
                targetSectionId = 'remoteIssuanceSection';
                showSubSection('remoteIssuanceSection', 'gamingControlSection');
            } else if (linkId === 'gameItemsSidebarLink') {
                targetSectionId = 'gameItemIssuanceSection';
                showSubSection('gameItemIssuanceSection', 'gamingControlSection');
            } else if (linkId === 'fireAlarmsSidebarLink') {
                targetSectionId = 'fireAlarmsSection';
                showSubSection('fireAlarmsSection', 'generatorSection');
            } else if (linkId === 'powerBlackoutSidebarLink') {
                targetSectionId = 'powerBlackoutSection';
                showSubSection('powerBlackoutSection', 'generatorSection');
            } else if (linkId === 'fuelDeliverySidebarLink') {
                targetSectionId = 'fuelDeliverySection';
                showSubSection('fuelDeliverySection', 'generatorSection');
            } else if (linkId === 'dailyFuelSidebarLink') {
                targetSectionId = 'dailyFuelSection';
                showSubSection('dailyFuelSection', 'generatorSection');
            } else if (linkId === 'fuelTopUpSidebarLink') {
                targetSectionId = 'fuelTopUpSection';
                showSubSection('fuelTopUpSection', 'generatorSection');
            } else if (linkId === 'statementsSidebarLink') {
                targetSectionId = 'statementsSection';
                showSubSection('statementsSection', 'recordsSection');
            } else if (linkId === 'gatepassSidebarLink') {
                targetSectionId = 'gatepassSection';
                showSubSection('gatepassSection', 'recordsSection');
            } else if (linkId === 'patrolReportSidebarLink') {
                targetSectionId = 'patrolReportSection';
                showSubSection('patrolReportSection', 'recordsSection');
            } else if (linkId.includes('SidebarLink')) {
                // Extract section name from the link ID
                // For example, keyControlSidebarLink -> keyControlSection
                targetSectionId = linkId.replace('SidebarLink', 'Section');
            }
            
            if (targetSectionId) {
                // Show the target section and hide others
                showSection(targetSectionId);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 992) {
                    closeSidebar();
                }
            }
        });
    });
    
    // Function to show a specific section and hide others
    function showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
    
    // Function to show a subsection within a parent section
    function showSubSection(subSectionId, parentSectionId) {
        // First make sure the parent section is visible
        showSection(parentSectionId);
        
        // Then show the specific subsection
        const subSections = document.querySelectorAll(`#${parentSectionId} .sub-section`);
        subSections.forEach(subSection => {
            subSection.style.display = 'none';
        });
        
        const targetSubSection = document.getElementById(subSectionId);
        if (targetSubSection) {
            targetSubSection.style.display = 'block';
        }
    }
    
    // Update active link based on current page section (on page load)
    function updateActiveLinkOnLoad() {
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            const sectionId = activeSection.id;
            let activeLinkId;
            
            // Map section IDs to sidebar link IDs (reverse of the above mapping)
            if (sectionId === 'homeSection') {
                activeLinkId = 'dashboardLink';
            } else if (sectionId.includes('Section')) {
                // Convert sectionId to corresponding linkId
                // For example, keyControlSection -> keyControlSidebarLink
                activeLinkId = sectionId.replace('Section', 'SidebarLink');
            }
            
            if (activeLinkId) {
                const activeLink = document.getElementById(activeLinkId);
                if (activeLink) {
                    sidebarLinks.forEach(link => link.classList.remove('active'));
                    activeLink.classList.add('active');
                    
                    // If the active link is in a submenu, open that submenu
                    const parentItem = activeLink.closest('.sidebar-item.has-submenu');
                    if (parentItem) {
                        parentItem.classList.add('open');
                    }
                }
            }
        }
    }
    
    // Call this function on page load
    updateActiveLinkOnLoad();
});