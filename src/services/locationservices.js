let map;
let garageSales = [
    { id: 1, title: 'Garage Sale on Main St', address: '', lat: 26.6469, lng: -81.8647, date: '2024-10-05' },
    { id: 2, title: 'Moving Sale', address: '456 Elm St', lat: 37.7849, lng: -122.4094, date: '2024-10-10' }
];

// Initialize and display the map
function initMap() {
    map = L.map('map').setView([26.6469, -81.8647], 12); // Centered on 3916 Orange Grove Blvd, North Fort Myers, FL
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    garageSales.forEach(sale => {
        addMarker(sale); // Add existing garage sales as markers on the map
    });
}

// Add a marker for a garage sale
function addMarker(sale) {
    const marker = L.marker([sale.lat, sale.lng]).addTo(map)
        .bindPopup(`<h3>${sale.title}</h3><p>${sale.address}</p><p>Date: ${sale.date}</p>`);
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    const title = document.getElementById('title').value;
    const address = document.getElementById('address').value;
    const date = document.getElementById('date').value;

    // Geocode the address to get latitude and longitude
    geocodeAddress(address, (lat, lng) => {
        const newSale = { id: garageSales.length + 1, title, address, lat, lng, date };
        garageSales.push(newSale); // Add new garage sale to the array
        addMarker(newSale); // Add the marker to the map
        document.getElementById('garage-sale-form').reset(); // Clear the form
    });
}

// Use Nominatim (OpenStreetMap's geocoding service) to convert the address to latitude and longitude
function geocodeAddress(address, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
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

// Set up event listener for form submission
document.getElementById('garage-sale-form').addEventListener('submit', handleFormSubmit);

// Load garage sales when the page is loaded
window.onload = initMap;
