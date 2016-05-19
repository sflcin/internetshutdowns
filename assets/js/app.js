var shutdowns = {}, states = [], colorScales = [];

var defaultLat = 23;
var defaultLng = 90;
var defaultZoom = 4;

var defaultColor = 'grey';
var startColor = '#a6bddb';
var endColor = '#2b8cbe';

$.getJSON("data/shutdowns.json", function (data) {
  prepareData(data);
  addLegend();
});

/*
  Parse raw data to prepare data for visualization.
  1. Generate year-wise statistics
  2. TBD
*/
function prepareData(raw) {
  /* Sort the data in reverse chronology */
  raw.sort(function (one, another) {
    return (new Date(one.date).getTime() - new Date(another.date).getTime()) * -1;
  });
  shutdowns.data = raw;
  shutdowns.yearWise = _.groupBy(raw, function (o) { return moment(o.date).year(); });
  shutdowns.stateWise = _.groupBy(raw, 'state');
  shutdowns.maxCount = _.max(_.map(_.countBy(shutdowns.data, 'state'), function (o) { return o; }));
  shutdowns.colors = chroma.scale([startColor, endColor]).colors(shutdowns.maxCount);
  shutdowns.colors.unshift("grey");
}

function stateDetails (name) {
  if (shutdowns.stateWise[name]) {
    var info = "<div class='shutdown-details'>";
    shutdowns.stateWise[name].forEach(function (item) {
      info += "<div class='shutdown-case'>";
      info += "<div class='shutdown date fa fa-calendar'>" + moment(item.date).format("DD MMMM YYYY") + " </div>";
      info += "<div class='shutdown source fa fa-external-link'> <a href='" + item.source + "'> Source </a> </div>";
      info += "<div class='shutdown desc'>" + item.description + " </div>";
      info += "</div>";
    });
    info += "</div>";
    return info;
  } else {
    return 0;
  }
}

// Create the map
var map = L.map('map').setView([defaultLat, defaultLng], defaultZoom);

// Disable scrollwheel zooming
map.scrollWheelZoom.disable();

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
  maxZoom: 20,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.light'
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info sidebar');
  this.update();
  return this._div;
};

info.update = function (props, stateHTML) {
  var count = 0;
  var header = '<h4>Internet Shutdowns Info</h4>';
  var hint = '<i> Click on a state for detailed information </i>';


  if (props && props.name) {
    var stateName = '<div class= "shutdown-state">' + props.name + '</div>';
    if (shutdowns.stateWise[props.name]) {
      count = shutdowns.stateWise[props.name].length;
    }
    var summary = '<div class = "shutdown summary"><span class="shutdown count">' + count + '</span></div>';
    this._div.innerHTML = header + stateName + summary;
    if (stateHTML) {
      this._div.innerHTML += stateHTML;
    }
  } else {
    this._div.innerHTML = header + hint;
  }
};

info.addTo(map);

// Avoid scrolling map when scrolling in info box
info.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

// Re-enable dragging when user's cursor leaves the element
info.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});


function getColor(stateName) {
  var color = (shutdowns.stateWise[stateName])? shutdowns.colors[shutdowns.stateWise[stateName].length]: defaultColor;
  return color;
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.name)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera) {
    layer.bringToFront();
  }
}

var states;

function resetHighlight(e) {
  states.resetStyle(e.target);
}

function zoomToFeature(e) {
  if (shutdowns.stateWise[e.target.feature.properties.name]) {
    map.fitBounds(e.target.getBounds());
  }
}

function showStateInfo(e) {
  var stateHTML = stateDetails(e.target.feature.properties.name);
  info.update(e.target.feature.properties, stateHTML);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: showStateInfo
  });
}

var states = L.geoJson(null, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

$.getJSON("data/india_states.geojson", function (data) {
  states.addData(data);
});

map.attributionControl.addAttribution('<span class="data-license"><strong>Data compiled by SFLC.in</strong></span>');

/* Legend */

var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

  var container = L.DomUtil.create('div', 'legend info');

  container.innerHTML = "<div class='range' style='background: linear-gradient(90deg, " + startColor + "," + endColor + ");'>" +
    "<span class='min'>0</span><span class='max'>" +
    shutdowns.maxCount +
    "</span> </div>";

  var instructions = L.DomUtil.create('div', 'instructions', container);
  instructions.innerHTML = "Report issues | Contribute code | <a class='fa fa-gitlab fa-calendar' href='https://gitlab.com/sflc.in/internetshutdowns'>GitLab</a>";

  return container;
};

function addLegend() {
  legend.addTo(map);
}

function resetView() {
  map.setView([defaultLat, defaultLng], defaultZoom);
}

map.on('popupclose', function (e) {
  resetView();
});
