// ==========================================
// common.js - Shared Script for All Inner Pages
// Checks login status, handles logout, shows name
// ==========================================

// Check if user is logged in
var savedUserData = localStorage.getItem('badmintonUser');

// If there is no saved user, redirect back to login page
if (!savedUserData) {
    alert('Please log in first!');
    window.location.href = 'index.html';
}

// When the page finishes loading, setup greeting and logout button
window.onload = function() {
    // Read the user object from localStorage
    if (savedUserData) {
        var currentUser = JSON.parse(savedUserData);

        // If the page has a welcome greeting element, show user's name
        var greetingElement = document.getElementById('studentGreeting');
        if (greetingElement) {
            greetingElement.innerHTML = currentUser.name || currentUser.username;
        }
    }

    // Attach click event to the logout button
    var logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.onclick = function() {
            // Remove user data from localStorage
            localStorage.removeItem('badmintonUser');

            // Show alert message
            alert('You have logged out successfully.');

            // Redirect back to login page
            window.location.href = 'index.html';
        };
    }
};
