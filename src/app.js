let map;
let garageSales = [];

// Initialize and display the map
function initMap() {
    map = L.map('map').setView([26.6469, -81.8647], 12); // Centered on a default location
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);
    
}

// Add a marker for a garage sale
function addMarker(sale) {
    const marker = L.marker([sale.lat, sale.lng]).addTo(map)
        .bindPopup(`
            <h3>${sale.title}</h3>
            <p>${sale.address}</p>
            <p>Date: ${sale.date}</p>
            <p>${sale.description}</p>
            ${sale.photo ? `<img src="${sale.photo}" alt="${sale.title}" style="max-width: 100%; height: auto; max-height: 200px;" />` : ''}
        `); // Added description and image to popup
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    const title = document.getElementById('title').value;
    const address = document.getElementById('address').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value; // Get the description
    const photoInput = document.getElementById('photo'); // Get the file input
    const photo = photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : null; // Create a URL for the uploaded photo

    // Geocode the address to get latitude and longitude
    geocodeAddress(address, (lat, lng) => {
        const newSale = { id: garageSales.length + 1, title, address, lat, lng, date, description, photo }; // Include description and photo
        garageSales.push(newSale); // Add new garage sale to the array
        addMarker(newSale); // Add the marker to the map
        addSaleToList(newSale); // Add the new sale to the list
        document.getElementById('garage-sale-form').reset(); // Clear the form
        photoInput.value = ''; // Clear the file input
        updateFileLabel(); // Reset the file upload label
    });
}

// Use Nominatim (OpenStreetMap's geocoding service) to convert the address to latitude and longitude
function geocodeAddress(address, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=5`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                callback(lat, lng); // Pass the latitude and longitude to the callback
            } else {
                alert('Could not find location');
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            alert('Geocoding error: ' + error.message);
        });
}

// Add a garage sale to the list on the page
function addSaleToList(sale) {
    const appDiv = document.getElementById('app');
    const saleBlock = document.createElement('div');
    saleBlock.className = 'sale-block';
    saleBlock.innerHTML = `
        <h3>${sale.title}</h3>
        <p>${sale.address}</p>
        <p>Date: ${sale.date}</p>
        <p>${sale.description}</p>
        ${sale.photo ? `<img src="${sale.photo}" alt="${sale.title}" style="max-width: 100%; height: auto; max-height: 200px;" />` : ''}
        <button onclick="centerMap(${sale.lat}, ${sale.lng})">View on Map</button>
    `;
    appDiv.appendChild(saleBlock);
}

// Center the map on the selected garage sale
function centerMap(lat, lng) {
    map.setView([lat, lng], 15); // Zoom in on the selected location
}

// Update file label and show selected state
function updateFileLabel() {
    const fileInput = document.getElementById('photo');
    const fileUploadLabel = document.getElementById('file-upload-label');

    if (fileInput.files.length > 0) {
        // Change the label to the selected state
        fileUploadLabel.classList.add('selected');
        fileUploadLabel.textContent = fileInput.files[0].name; // Show selected file name
    } else {
        // Remove the selected state if no file is chosen
        fileUploadLabel.classList.remove('selected');
        fileUploadLabel.textContent = "Choose File"; // Reset text
    }
}

// Set up event listener for form submission
document.getElementById('garage-sale-form').addEventListener('submit', handleFormSubmit);

// Load garage sales when the page is loaded
window.onload = initMap;

// Custom file upload button functionality
const fileUploadInput = document.getElementById('photo');
const fileUploadLabel = document.getElementById('file-upload-label'); // Update to get the correct label

fileUploadLabel.addEventListener('click', function () {
    fileUploadInput.click(); // Trigger file input when custom button is clicked
});

fileUploadInput.addEventListener('change', function () {
    updateFileLabel(); // Update the label based on file selection
});

// Suggestions for address completion
const addressInput = document.getElementById('address');
const suggestionsDropdown = document.createElement('div');
suggestionsDropdown.className = 'suggestions-dropdown';
addressInput.parentNode.insertBefore(suggestionsDropdown, addressInput.nextSibling);

// Address suggestions logic
addressInput.addEventListener('input', () => {
    const query = addressInput.value;
    if (query.length > 2) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
            .then(response => response.json())
            .then(data => {
                suggestionsDropdown.innerHTML = '';
                if (data.length > 0) {
                    suggestionsDropdown.style.display = 'block';
                    data.forEach(location => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.className = 'suggestion-item';
                        suggestionItem.textContent = `${location.display_name}`;
                        suggestionItem.addEventListener('click', () => {
                            addressInput.value = location.display_name; // Fill the input with the selected suggestion
                            suggestionsDropdown.style.display = 'none'; // Hide suggestions
                        });
                        suggestionsDropdown.appendChild(suggestionItem);
                    });
                } else {
                    suggestionsDropdown.style.display = 'none'; // Hide suggestions if no results
                }
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
            });
    } else {
        suggestionsDropdown.style.display = 'none'; // Hide suggestions if query is too short
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!suggestionsDropdown.contains(event.target) && event.target !== addressInput) {
        suggestionsDropdown.style.display = 'none';
    }
});
