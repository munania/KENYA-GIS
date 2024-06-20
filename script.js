// Initialize the map
// var map = L.map('map').setView([-1.2921, 36.8219], 6); // Set the initial view of Kenya
var map = L.map('map', {
    center: [0.2, 37.9],
    zoom: 7
}); // Set the initial view of Kenya

// Add base layer (e.g., OpenStreetMap)
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
// }).addTo(map);

// Array to keep track of selected counties
var selectedCounties = [];

// Load GeoJSON data
fetch('kenya_counties.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function () {
                return { color: 'gray', weight: 1 }; // Default county color
            },
            onEachFeature: function (feature, layer) {
                layer.on('click', function (e) {
                    toggleCountySelection(layer, feature.properties.COUNTY_NAM);
                    displayCountyInfo();
                });
                layer.bindPopup(feature.properties.COUNTY_NAM);
            }
        }).addTo(map);
    });

// Toggle county selection
function toggleCountySelection(layer, countyName) {
    var isSelected = selectedCounties.find(function (item) {
        return item.name === countyName;
    });
    if (isSelected) {
        // Deselect the county
        layer.setStyle({ fillColor: 'gray', fillOpacity: 0.2, weight: 1 }); // Reset county style
        var index = selectedCounties.findIndex(function (item) {
            return item.name === countyName;
        });
        selectedCounties.splice(index, 1); // Remove county from selectedCounties array
    } else {
        // Select the county
        var color = getRandomColor(); // Get a random color
        layer.setStyle({ fillColor: color, fillOpacity: 0.7, weight: 3 }); // Change selected county color and increase border weight
        selectedCounties.push({ name: countyName, color: color }); // Add county to selectedCounties array
    }
}

// Get a random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var colors = [];
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Display selected county information
function displayCountyInfo() {
    var legendTitle = document.getElementById('legend-title').value;
    var legendDetails = '';
    selectedCounties.forEach(function (county) {
        legendDetails += '<div class="legend-item"><span class="legend-color" style=" background-color: ' + county.color + '"></span>' + county.name + '</div>';
    });
    document.getElementById('legend-details').innerHTML = legendDetails;
}


// Export map as PNG
function exportImage() {
    var legendContent = '<h2>' + document.getElementById('legend-title').value + '</h2>';
    selectedCounties.forEach(function (county) {
        legendContent += '<div class="legend-item"><span class="legend-color" style="background-color: ' + county.color + '"></span>' + county.name + '</div>';
    });
    var mapContainer = document.getElementById('map');

    domtoimage.toBlob(mapContainer)
        .then(function (blob) {
            var link = document.createElement('a');
            link.download = 'kenya_map.png';
            link.href = URL.createObjectURL(blob);
            link.click();
        });
}

// Export map as PPT
function exportPPT() {
    let pptx = new PptxGenJS();
    // let slide = pptx.addSlide();

    var mapContainer = document.getElementById('map');
    var legendContainer = document.getElementById('legend-details');

    Promise.all([
        domtoimage.toPng(mapContainer),
        domtoimage.toPng(legendContainer)
    ]).then(function (results) {
        var mapDataUrl = results[0];
        var legendDataUrl = results[1];

        // Add slide with map
        var slide = pptx.addSlide();
        slide.addImage({
            data: mapDataUrl,
            x: 0.1,
            y: 0.0,
            w: 5.3,
            h: 6.2
        });

        // Add slide with legend
        slide.addImage({
            data: legendDataUrl,
            x: 5,
            y: 3.0,
            w: 1.5,
            h: 2.2
        });

        pptx.writeFile('kenya_map_with_legend.pptx');
    });



}


// Export map as XLSX
function exportXLSX() {
    var wb = XLSX.utils.book_new();
    var ws_all = XLSX.utils.json_to_sheet(selectedCounties.map(function (county) { return { "County Name": county.name }; }));
    XLSX.utils.book_append_sheet(wb, ws_all, "Selected Counties");

    // Fetch all counties and export to XLSX
    fetch('kenya_counties.geojson')
        .then(response => response.json())
        .then(data => {
            var allCounties = data.features.map(function (feature) {
                return { "County Name": feature.properties.COUNTY_NAM };
            });
            var ws_all = XLSX.utils.json_to_sheet(allCounties);
            XLSX.utils.book_append_sheet(wb, ws_all, "All Counties");

            // Save XLSX file
            XLSX.writeFile(wb, "kenya_counties.xlsx");
        });
}

// Export map as CSV
function exportCSV() {

}

