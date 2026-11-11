// ==========================================
// equipment.js - Equipment Table Search Filter
// Filters table rows as the user types
// ==========================================

function searchEquipment() {
    // Read search input in lowercase
    var input = document.getElementById('equipSearch');
    var filter = input.value.toLowerCase();

    // Get the table and all rows
    var table = document.getElementById('equipTable');
    var tr = table.getElementsByTagName('tr');

    // Loop through table rows starting from index 1 (skipping header row)
    for (var i = 1; i < tr.length; i++) {
        var rowText = tr[i].innerHTML.toLowerCase();

        // Check if row contains the search keyword
        if (rowText.indexOf(filter) > -1) {
            tr[i].style.display = '';
        } else {
            tr[i].style.display = 'none';
        }
    }
}
