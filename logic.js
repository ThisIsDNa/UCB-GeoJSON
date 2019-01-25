// ---------------------------------------------------------------------------------------------------
// 1. Redo, start with basemap
//  2. 
// Store our API endpoint inside queryUrl
// Perform a GET request to the query URL
// Once we get a response, send the data.features object to the createFeatures function
// ---------------------------------------------------------------------------------------------------
var query = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicQuery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var tectonic = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

d3.json(query, function(data) {
  createFeatures(data.features);
})

d3.json(tectonicQuery, function(plates) {
    L.geoJSON(plates, {
          color: "blue",
          weight: 2
    }).addTo(tectonic);
});

// ---------------------------------------------------------------------------------------------------
// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
// Sending our earthquakes layer to the createMap function
// ---------------------------------------------------------------------------------------------------

function getColor(d) {
   return d < 1  ? '#FAEBD7' :
          d < 2  ? '#90EE90' :
          d < 3  ? '#98FB98' :
          d < 4  ? '#7CFC00' :
          d < 5  ? '#32CD32' :
          d < 6  ? '#228B22' :
                   '#008000' ;
 }

function createFeatures(earthquakes) { 
  function pointToLayer(feature, latlng){
          return new L.circle(latlng,
          {radius: 4*feature.properties.mag,
           fillColor: "#000000",
           weight: 1,
           opacity: 0.75,
           fillOpacity: 0.8});
  }
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + 
                    new Date(feature.properties.time) + "</p>" + 
                    "</h3><hr><p>Magnitude (ML): " + feature.properties.mag + "</p>")
  }

  var earthquakes = L.geoJson(earthquakes, {
//    onEachFeature: function (feature, layer){
//        layer.bindPopup("<h3>" + feature.properties.place +
//        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
//        "</h3><hr><p>Magnitude (ML): " + feature.properties.mag + "</p>");
//    },
//    pointToLayer: function (feature, latlng) {
//      return new L.circle(latlng,
//        {radius: 4*feature.properties.mag,
//         fillColor: "#000000",
//         weight: 1,
//         opacity: 0.75,
//         fillOpacity: 0.8});
//    }
      pointToLayer: pointToLayer,
      onEachFeature: onEachFeature
  });
createMap(earthquakes);
}
// ---------------------------------------------------------------------------------------------------
// Define streetmap and darkmap layers
// Define a baseMaps object to hold our base layers
// Create overlay object to hold our overlay layer
// Create our map, giving it the streetmap and earthquakes layers to display on load
// Sending our earthquakes layer to the createMap function
//
// https://stackoverflow.com/questions/28217868/mapbox-tile-is-not-being-added-to-leaflet-js-map
// ---------------------------------------------------------------------------------------------------
function createMap(earthquakes) {

var streetmap = L.tileLayer('https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    mapId: 'mapbox.streets',
    token: API_KEY
});

var lightmap = L.tileLayer('https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}', {
     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
     maxZoom: 18,
     mapId: 'mapbox.light',
     token: API_KEY
});

var darkmap = L.tileLayer('https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}', {
     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
     maxZoom: 18,
     mapId: 'mapbox.dark',
     token: API_KEY
});

var baseMaps = {
    "Light Map": lightmap,
    "Street Map": streetmap,
    "Dark Map": darkmap
};

var overlayMaps = {
  Earthquakes: earthquakes,
  TectonicPlates: tectonic
};      
  
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

var legend = L.control({position: 'bottomright'});
  

// ---------------------------------------------------------------------------------------------------
// Create a legend to display information about the map
// Loop through our density intervals and generate a label with a colored square for each interval
// 
// ---------------------------------------------------------------------------------------------------

legend.onAdd = function (myMap) {
   var div = L.DomUtil.create('div', 'info legend'),
       magnitude = [0, 1, 2, 3, 4, 5, 6];
       labels = [];  
       for (var i = 0; i < magnitude.length; i++) {
           div.innerHTML += '<i style="background:' + getColor(magnitude[i] + 1) + '"></i> ' +
                             magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + 
                            '<br>' : '+');
       }
   return div;
   };  
 legend.addTo(myMap);
 }
