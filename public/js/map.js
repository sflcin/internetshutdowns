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
        map.setFilter('india-states', ['==', 'name', feature.properties.name]);
        map.setFilter('india-states-below-4', ['==', 'name', feature.properties.name]);
        document.getElementById('features').innerHTML = features[0].properties.name + ' ' + features[0].properties.shutdowns + JSON.stringify(feature);
    } else {
        document.getElementById('features').innerHTML = '';
    }
});
