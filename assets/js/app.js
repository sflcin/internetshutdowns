var shutdowns = {}, states = [], colorScales = [];

var defaultLat = 23;
var defaultLng = 90;
var defaultZoom = 4;

var defaultColor = 'grey';
var startColor = 'yellow';
var endColor = 'red';

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
    var stateName = '<div class= "shutdown-state-name">' + name + '</div>';
    count = shutdowns.stateWise[name].length;
    var summary = '<div class = "shutdown summary">' + count + ' shutdowns reported so far</div>';
    shutdowns.stateWise[name].forEach(function (item) {
      info += "<div class='shutdown-case'>";
      info += "<div class='shutdown date'>" + item.date + " </div>";
      info += "<div class='shutdown desc'>" + item.description + " </div>";
      info += "<div class='shutdown source'> <a href='" + item.source + "'> Source </a> </div>";
      info += "</div>";
    });
    info += "</div>";
    return info;
  } else {
    return 0;
  }
}

var map = L.map('map').setView([defaultLat, defaultLng], defaultZoom);

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
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  var count = 0;
  var header = '<h4>Internet Shutdowns Info</h4>';
  var hint = '<i> Hover over a state for info </i>';


  if (props && props.name) {
    var stateName = '<div class= "shutdown-state">' + props.name + '</div>';
    if (shutdowns.stateWise[props.name]) {
      count = shutdowns.stateWise[props.name].length;
    }
    var summary = '<div class = "shutdown summary">' + count + ' shutdowns reported so far</div>';
    this._div.innerHTML = header + stateName + summary;
  } else {
    this._div.innerHTML = header + hint;
  }
};

info.addTo(map);


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

  info.update(layer.feature.properties);
}

var states;

function resetHighlight(e) {
  states.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
  var popupContent = stateDetails(feature.properties.name);
  if (popupContent) {
    layer.bindPopup(popupContent);
  }
}

var states = L.geoJson(null, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

$.getJSON("data/india_states.geojson", function (data) {
  states.addData(data);
});

map.attributionControl.addAttribution('<span class="data-license"><strong>Data compiled by SFLC.in</strong></span>');

/* Legend (disabled) */

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'legend info'),
    labels = [];

  for (var i = 0; i <= shutdowns.maxCount; i++) {
    labels.push(
      '<i style="background:' + shutdowns.colors[i] + '"> </i> ' + i);
  }

  div.innerHTML = labels.join('<br>');
  return div;
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
