(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ1bmFzYW5rIiwiYSI6ImRKNlNQa3MifQ.SIx-g-J1oWWlP4grTXopcg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/arunasank/ciwbud66o004b2pockn08tjkq',
    center: [82.75, 21.82],
    zoom: 4
});

var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

map.on('load', function() {
  mapboxgl.addClaimedBoundaries(map, 'IN');
  var sw = new mapboxgl.LngLat(60.073, 11.953);
  var ne = new mapboxgl.LngLat(99.756, 37.335);
  var llb = new mapboxgl.LngLatBounds(sw, ne);
  map.fitBounds(llb);

  // Get shutdowns data
  $.get("../data/shutdowns.json", function (data, status) {
    map.addSource("shutdowns", {
      "type": "geojson",
      "data": data
    });
  });
  sidebar.reset();
});


map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['india-states', 'india-states-fill', 'india-states-fill-below-4', 'india-states-below-4']
    });
    map.getCanvas().style.cursor = features.length ? 'pointer' : '';
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
        // document.getElementById('features').innerHTML = features[0].properties.name + ' ' + features[0].properties.shutdowns + JSON.stringify(feature);

        var popupContent = setPopupContent({
          name: feature.properties.name,
          shutdowns: feature.properties.shutdowns
        });

        popup.setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map);
    } else {
        //restore map to original state when the user is not hovering over a state
        // document.getElementById('features').innerHTML = '';
        map.setFilter('india-states', ['has', 'name']);
        map.setFilter('india-states-below-4', ['has', 'name']);
        map.setPaintProperty('india-states', 'line-width', 2);
        map.setPaintProperty('india-states-below-4', 'line-width', 2);
        popup.remove();
    }
});


map.on('click', function (e) {
  // Fly to the state
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['india-states', 'india-states-fill', 'india-states-fill-below-4', 'india-states-below-4']
  });
  if (features[0]) {
    var feature = {
      type: features[0].type,
      properties: features[0].properties,
      geometry: features[0].geometry
    };
    var stateCenter = turf.center(feature.geometry);
    map.flyTo({
      center: stateCenter.geometry.coordinates,
      zoom: 5,
      speed: 0.8
    });

    var shutdowns = map.getSource('shutdowns')._data;
    var stateShutdowns = shutdowns.features.filter(function(item) {
      return item.properties.state == feature.properties.name
    });

    sidebar.setData({
      state: feature.properties.name,
      count: feature.properties.shutdowns,
      shutdowns: stateShutdowns
    });

    //*****************************************************************
    // make districts in a clicked state visible
    map.setLayoutProperty('shutdownsdistricts', 'visibility', 'visible');
    map.setFilter('shutdownsdistricts', ['==', 'state', features[0].properties.name]);
    map.setFilter('india-states-below-4', ['==', 'name', features[0].properties.name]);
    map.setFilter('india-states', ['==', 'name', features[0].properties.name]);
    map.setPaintProperty('india-states', 'line-width', 5);
    map.setPaintProperty('india-states-below-4', 'line-width', 5);
    map.setLayoutProperty('shutdowns-1', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-3', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-5', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-7', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-19', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-1-outer', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-3-outer', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-5-outer', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-7-outer', 'visibility', 'none');
    map.setLayoutProperty('shutdowns-19-outer', 'visibility', 'none');
    //*****************************************************************
  } else {
    map.reset();
    sidebar.reset();
  }
});

map.reset = function() {
  map.flyTo({
    center: [82.75, 21.82],
    zoom: 4,
    speed: 0.9
  });
  map.setFilter('india-states', ['has', 'name']);
  map.setFilter('india-states-below-4', ['has', 'name']);
  map.setFilter('shutdownsdistricts', ['has', 'state']);
  map.setPaintProperty('india-states', 'line-width', 2);
  map.setPaintProperty('india-states-below-4', 'line-width', 2);
  map.setLayoutProperty('shutdownsdistricts', 'visibility', 'none');
  map.setLayoutProperty('shutdowns-1', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-3', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-5', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-7', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-19', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-1-outer', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-3-outer', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-5-outer', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-7-outer', 'visibility', 'visible');
  map.setLayoutProperty('shutdowns-19-outer', 'visibility', 'visible');
}

function setPopupContent(options) {
  var popupHTML = "<div class='statePopup'>";
  popupHTML += "<strong class='header text-center'>" + options.name + "</strong><br>";
  popupHTML += "<p class='text'>Number of Shutdowns: <span class='count'>" + options.shutdowns + "</span></p>";
  popupHTML += "<small> Click for detailed report </small>"
  popupHTML += "</div>"
  return popupHTML;
}

$('#resetBtn').on('click', function () {
  map.reset();
  sidebar.reset();
});

// Ractive Stuff
var ractive = new Ractive({
  el: "#sidebar",
  template: "#sidebar-template",
  data: {
    count: "..",
    formatDate: function (date) {
      return moment(date).format('DD-MM-YYYY');
    }
  }
});

ractive.on('resetMapAndSidebar', function () {
  map.reset();
  sidebar.reset();
});

var sidebar = {
  reset: function () {
    ractive.set({
      title: "India",
      count: 46,
      shutdowns: undefined
    });
  },
  setTitle: function (title) {
    ractive.set({
      title: title
    });
  },
  setData: function (data) {
    ractive.set({
      title: data.state,
      count: data.count,
      shutdowns: data.shutdowns
    });
  }
};

},{}]},{},[1]);
