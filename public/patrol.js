// This function should be added to your patrol.js file or main.js file
document.addEventListener('DOMContentLoaded', function() {
    // Get the patrol report button from the navigation
    const patrolReportBtn = document.getElementById('patrolReportBtn');
    
    // Add click event listener to the patrol report button
    if (patrolReportBtn) {
        patrolReportBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default navigation behavior
            
            // Open the Microsoft Forms link in a new tab
            window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=UJyUaijlmkybTlfsIHipafi_TsaqDw9BoVHHhksyDYBUMFpXNURTWlhBQ1JYQk1FV0hIV0Q3N0k1Sy4u', '_blank');
        });
    }

    
});