(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ1bmFzYW5rIiwiYSI6ImRKNlNQa3MifQ.SIx-g-J1oWWlP4grTXopcg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/arunasank/ciwbud66o004b2pockn08tjkq',
    center: [82.75, 21.82],
    zoom: 4
});
map.on('load', function() {
    var sw = new mapboxgl.LngLat(60.073, 11.953);
    var ne = new mapboxgl.LngLat(99.756, 37.335);
    var llb = new mapboxgl.LngLatBounds(sw, ne);
    map.fitBounds(llb);
});


map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['india-states', 'india-states-fill', 'india-states-fill-below-4', 'india-states-below-4']
    });
    if (features[0]) {
        var feature = {
            type: features[0].type,
            properties: features[0].properties,
            geometry: features[0].geometry
        };
        //Thicken one state when the user is hovering over the state
        map.setFilter('india-states', ['==', 'name', feature.properties.name]);
        map.setFilter('india-states-below-4', ['==', 'name', feature.properties.name]);
        map.setPaintProperty('india-states', 'line-width', 5);
        map.setPaintProperty('india-states-below-4', 'line-width', 5);
        document.getElementById('features').innerHTML = features[0].properties.name + ' ' + features[0].properties.shutdowns + JSON.stringify(feature);
    } else {
        //restore map to original state when the user is not hovering over a state
        document.getElementById('features').innerHTML = '';
        map.setFilter('india-states', ['has', 'name']);
        map.setFilter('india-states-below-4', ['has', 'name']);
        map.setPaintProperty('india-states', 'line-width', 2);
        map.setPaintProperty('india-states-below-4', 'line-width', 2);
    }
});

},{}]},{},[1]);
