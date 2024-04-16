    function removeAlerts() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            alert.style.opacity = 1;
            setTimeout(function() {
                alert.style.transition = 'opacity 2s';
                alert.style.opacity = 0;
            }, 2000); 
            setTimeout(function() {
                alert.style.display = 'none';
            }, 4000); 
        });
    }

    // Call the removeAlerts function when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        removeAlerts();
    });
