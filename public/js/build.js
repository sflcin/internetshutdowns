(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
mapboxgl.accessToken = "pk.eyJ1Ijoic2ZsY2luIiwiYSI6ImNpd2xxb3UweTAwNXgyeXF4MjFzZG91dDMifQ.UZ43ek7Vo4lhabuxdlt4jg";

var defaultMapCenter = [80.181,27.161];
var defaultMapZoom = 3.45;
var defaultMaxBounds = [[50.3,5.45], [110,39]];

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/sflcin/ciys0k3oy00082sppcs5ouh6l',
    center: defaultMapCenter,
    maxBounds: defaultMaxBounds,
    zoom: defaultMapZoom,
    minZoom: 3.45,
    maxZoom: 6,
    scrollZoom: false
});

var navigation = new mapboxgl.NavigationControl();
map.addControl(navigation, "top-right");

var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false
});

var shutdowns = {};

map.once('load', function() {
  mapboxgl.addClaimedBoundaries(map, 'IN');

  // Get shutdowns data
  $.get("https://ist-backend.herokuapp.com/shutdowns", function (data) {
    data = sortShutdownsByDate(data);
    shutdowns.count = data.length;
    shutdowns.data = data;
    shutdowns.byState = getShutdownsByState(data);
    shutdowns.byDistrict = getShutdownsByDistrict(data);
    shutdowns.byYear = getShutdownsByYear(data);

    setupLayers();
    sidebar.reset();
    mobileHeader.reset();
    // generateCharts();
  });
});

function setupLayers() {
  // State boundaries and fill

  map.addLayer({
    "id": "selected-state-boundary",
    "type": "line",
    "source": "composite",
    "source-layer": "india_states_ajith-b2de3t",
    "paint": {
      "line-width": 1.5,
      "line-color": "#dc322f",
      "line-opacity": 0.9,
    },
    "filter": ["==", "state:name", ""],
  });

  map.addLayer({
    "id": "selected-state-fill",
    "type": "fill",
    "source": "composite",
    "source-layer": "india_states_ajith-b2de3t",
    "paint": {
      "fill-color": "#dc322f",
      "fill-opacity": 0.4,
    },
    "filter": ["==", "state:name", ""],
  });

  // District fills

  function fillColor(numShutdowns) {
    // From: http://ethanschoonover.com/solarized
    //  $yellow : #b58900;
    //  $orange : #cb4b16;
    //  $red    : #dc322f;
    if (numShutdowns > 3)
      return "#dc322f";
    if (numShutdowns > 2)
      return "#cb4b16";
    if (numShutdowns > 0)
      return "#b58900";
  }

  var colorStops = [];

  Object.keys(shutdowns.byDistrict).forEach(function(districtName) {
    var numShutdowns = shutdowns.byDistrict[districtName].length;
    colorStops.push([districtName, fillColor(numShutdowns)]);
  });

  map.addLayer({
    "id": "district-fill",
    "type": "fill",
    "source": "composite",
    "source-layer": "india_districts_ajith-a77oxw",
    "paint": {
      "fill-color": {
        "property": "district:name",
        "type": "categorical",
        "stops": colorStops,
      },
      "fill-opacity": 0.4,
    },
    "filter": ["==", "state:name", ""],
  });

  // Clusters (circles with a label)

  var clusterCircleLayerIds = [], clusterLabelLayerIds = [];

  Object.keys(shutdowns.byState).forEach(function(stateName, i) {
    var numShutdowns = shutdowns.byState[stateName].length;

    function circleColor(numShutdowns) {
      // From: http://ethanschoonover.com/solarized
      //  $yellow : #b58900;
      //  $orange : #cb4b16;
      //  $red    : #dc322f;
      if (numShutdowns > 10)
        return "#dc322f";
      if (numShutdowns > 3)
        return "#cb4b16";
      if (numShutdowns > 0)
        return "#b58900";
    }

    map.addLayer({
      "id": "cluster-circle-" + stateName,
      "type": "circle",
      "source": "composite",
      "source-layer": "india_states_points_ajith-03v3oj",
      "paint": {
        "circle-radius": {
          "base": 1,
          "stops": [
            [4, 18],
            [6, 14],
          ],
        },
        "circle-color": circleColor(numShutdowns),
        "circle-opacity": 0.7,
      },
      "filter": ["==", "state:name", stateName],
    });

    map.addLayer({
      "id": "cluster-label-" + stateName,
      "type": "symbol",
      "source": "composite",
      "mapzoom": 6,
      "source-layer": "india_states_points_ajith-03v3oj",
      "layout": {
        "text-field": "" + numShutdowns,
        "text-font": [
          "DIN Offc Pro Medium",
          "Arial Unicode MS Bold"
        ],
        "text-size": 14,
        "text-allow-overlap": true,
      },
      "paint": {
        "text-color": "white",
      },
      "filter": ["==", "state:name", stateName],
    });

    clusterCircleLayerIds.push("cluster-circle-" + stateName);
    clusterLabelLayerIds.push("cluster-label-" + stateName);
  });

  map.addLayer({
    "id": "cluster-circle-highlight",
    "type": "circle",
    "source": "composite",
    "source-layer": "india_states_points_ajith-03v3oj",
    "paint": {
      "circle-radius": {
        "base": 1,
        "stops": [
          [4, 23],
          [6, 19],
        ],
      },
      "circle-color": "#fdf6e3",
      "circle-opacity": 1,
    },
    "filter": ["==", "state:name", ""],
  }, clusterCircleLayerIds[0]);

  function highlightOnHover(e) {
    var hoveredStatePoints = map.queryRenderedFeatures([
      [e.point.x - 5, e.point.y - 5],
      [e.point.x + 5, e.point.y + 5]
    ], { layers: clusterCircleLayerIds });

    map.getCanvas().style.cursor = hoveredStatePoints.length ? 'pointer' : '';

    if (hoveredStatePoints.length) {
      var stateName = hoveredStatePoints[0].properties['state:name'];
      var lngLat = hoveredStatePoints[0].geometry.coordinates;
      var numShutdowns = shutdowns.byState[stateName].length;

      map.setFilter("cluster-circle-highlight", ["==", "state:name", stateName]);

      var popupContent = setPopupContent({
        name: stateName,
        shutdowns: numShutdowns,
      });

      popup.setLngLat([lngLat[0], lngLat[1] + 0.3])
        .setHTML(popupContent)
        .addTo(map);
    } else {
      popup.remove();
    }
  }

  function selectOnClick(e) {
    var clickedStatePoints = map.queryRenderedFeatures([
      [e.point.x - 5, e.point.y - 5],
      [e.point.x + 5, e.point.y + 5]
    ], { layers: clusterCircleLayerIds });

    if (clickedStatePoints.length) {
      var stateName = clickedStatePoints[0].properties['state:name'];
      var stateCenter = clickedStatePoints[0].geometry.coordinates;

      map.setFilter("selected-state-boundary", ["==", "state:name", stateName]);
      map.setFilter("selected-state-fill", ["==", "state:name", stateName]);
      map.setFilter("district-fill", ["==", "state:name", stateName]);

      map.flyTo({
        center: stateCenter,
        zoom: 5,
        speed: 0.8,
      });

      sidebar.setData({
        state: stateName,
        count: shutdowns.byState[stateName].length,
        shutdowns: shutdowns.byState[stateName],
        shutdownsByYear: getShutdownsByYear(shutdowns.byState[stateName])
      });
      mobileHeader.setData({
        state: stateName,
        count: shutdowns.byState[stateName].length,
        shutdowns: shutdowns.byState[stateName],
        shutdownsByYear: getShutdownsByYear(shutdowns.byState[stateName])
      });


    } else {
      map.setFilter("selected-state-boundary", ["==", "state:name", ""]);
      map.setFilter("selected-state-fill", ["==", "state:name", ""]);
      map.setFilter("district-fill", ["==", "state:name", ""]);

      map.flyTo({
        center: defaultMapCenter,
        zoom: defaultMapZoom,
        speed: 0.8,
      });

      sidebar.reset();
      mobileHeader.reset();
    }

    popup.remove();
  }

  map.on("mousemove", throttle(highlightOnHover, 100));
  map.on("click", selectOnClick);
}


// Utils

// Throttle event listeners
// Usage: map.on("event", throttle(listener, 200));
function throttle(listener, ms) {
  var last = 0;
  return function(event) {
    var now = performance.now();
    if (last == 0 || (now - last) > ms) {
        listener(event);
        last = now;
    }
  }
}

// Stats

function getShutdownsByState(shutdowns) {
  var shutdownsByState = {};

  shutdowns.forEach(function(shutdown) {
    var stateName = shutdown["state"];
    shutdownsByState[stateName] =
      (stateName in shutdownsByState)
        ? shutdownsByState[stateName].concat([shutdown])
        : [shutdown];
  });

  return shutdownsByState;
}

function getShutdownsByDistrict(shutdowns) {
  var shutdownsByDistrict = {};

  shutdowns.forEach(function(shutdown) {
    var districts = shutdown["districts"] || [];
    districts.forEach(function(districtName) {
      shutdownsByDistrict[districtName] =
        (districtName in shutdownsByDistrict)
          ? shutdownsByDistrict[districtName].concat([shutdown])
          : [shutdown];
    });
  });

  return shutdownsByDistrict;
}

function getShutdownsByYear(shutdowns) {
  var shutdownsByYear = [];

  shutdowns.forEach(function(shutdown) {
    var year = shutdown["date"].substr(0, 4);

    // Check if there is already an entry for this year in the array
    var found = false;
    for (var i = 0; i < shutdownsByYear.length; i++) {
      if (shutdownsByYear[i].year === year) {
        shutdownsByYear[i].shutdowns.push(shutdown);
        found = true;
      }
    }
    // If not, then add to the array
    if (!found) {
      shutdownsByYear.push({year: year, shutdowns: [shutdown]});
    }
  });

  return shutdownsByYear;
}

function sortShutdownsByDate (shutdownsToSort) {
  return shutdownsToSort.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });
}

map.reset = function() {
  map.flyTo({
    center: defaultMapCenter,
    zoom: defaultMapZoom,
    speed: 0.9
  });
}

function setPopupContent(options) {
  var popupHTML = "<div class='statePopup'>";
  popupHTML += "<strong class='header text-center'>" + options.name + "</strong><br>";
  popupHTML += "<p class='text'>Number of Shutdowns: <span class='count'>" + options.shutdowns + "</span></p>";
  popupHTML += "<small> Click for detailed report </small>"
  popupHTML += "</div>"
  return popupHTML;
}

$('#backBtn').on('click', function () {
  map.reset();
  sidebar.reset();
  mobileHeader.reset();
});
//
// $('#year-list-item').on('click', function () {
//   var year = $(this).attr('title');
//   sidebar.setShutdowns(year);
//   mobileHeader.setShutdowns(year);
// });

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
  mobileHeader.reset();
});

var sidebar = {
  reset: function () {
    ractive.set({
      title: "India",
      count: shutdowns.count,
      shutdowns: shutdowns.data,
      shutdownsByYear: shutdowns.byYear
    });
  },
  // setShutdowns: function (year) {
  //   ractive.set({
  //     shutdowns: data.shutdownsByYear[year]
  //   });
  // },
  setTitle: function (title) {
    ractive.set({
      title: title
    });
  },
  setData: function (data) {
    ractive.set({
      title: data.state,
      count: data.count,
      shutdowns: data.shutdowns,
      shutdownsByYear: data.shutdownsByYear
    });
  }
};

var mobileHeaderRactive = new Ractive({
  el: "#mobile-header",
  template: "#mobile-header-template",
  data: {
    count: "..",
    // TODO Move this to a common function
    formatDate: function (date) {
      return moment(date).format('DD-MM-YYYY');
    }
  }
});

var mobileHeader = {
  reset: function () {
    mobileHeaderRactive.set({
      title: "India",
      count: shutdowns.count,
      shutdowns: shutdowns.data,
      shutdownsByYear: shutdowns.byYear
    });
  },
  setTitle: function (title) {
    mobileHeaderRactive.set({
      title: title
    });
  },
  setData: function (data) {
    mobileHeaderRactive.set({
      title: data.state,
      count: data.count,
      shutdowns: data.shutdowns,
      shutdownsByYear: data.shutdownsByYear
    });
  }
};

mobileHeaderRactive.on('resetMapAndSidebar', function () {
  map.reset();
  mobileHeader.reset();
});

// Report a shutdown
// TODO: Captcha?

$(function(){
  $('#report').on('click', function(e){
    e.preventDefault();
    $.ajax({
      url: '/shutdown',
      type: 'POST',
      data: $('#report-shutdown').serialize(),
      success: function(data){
        $('#reportShutdownModal').modal('hide');
        $('#successModal').modal('show');
      },
      error: function(){
        $('#reportShutdownModal').modal('hide');
        $('#failureModal').modal('show');
      }
    });
  });

});

// Share your Experince
// TODO: Captcha?

$(function(){
  $('#share').on('click', function(e){
    e.preventDefault();
    $.ajax({
      url: '/experience',
      type: 'POST',
      data: $('#share-experience').serialize(),
      success: function(data){
        $('#shareExperienceModal').modal('hide');
        $('#shareExperienceSuccessModal').modal('show');
      },
      error: function(){
        $('#shareExperienceModal').modal('hide');
        $('#shareExperienceFailureModal').modal('show');
      }
    });
  });

});

// Splash prompt to sign the petition
/*
$(function(){
  var petitionPromptTimeout = setTimeout(function() {
    $('#petitionModal').modal('show');
    localStorage.setItem('promptShown', true);
  }, 30 * 1000);

  $('#signBtnOnModal').on('click', function (e) {
    $('#petitionModal').modal('hide');
  });
});
*/

// Social Share Kit Initialization
// Init Social Share Kit
SocialShareKit.init({
  url: 'https://internetshtudowns.in',
  twitter: {
    // title: "Say no to Internet Shutdowns! Learn more about what's going on."
  },
  onBeforeOpen: function(targetElement, network, paramsObj){
    console.log(arguments);
  },
  onOpen: function(targetElement, network, url, popupWindow){
    console.log(arguments);
  },
  onClose: function(targetElement, network, url, popupWindow){
    console.log(arguments);
  }
});

// Slick Slideshow init
$(document).ready(function(){
  $('.quotes-slideshow').slick({
    autoplay: true,
    autoplaySpeed: 10000,
    dots: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  });
});

// Colorbox init
baguetteBox.run('.trends-gallery');

// Charts with Charts.js
function generateCharts() {
  var ctx = document.getElementById("service").getContext("2d");
  var labels = [], counts = [],
      mobileCounts = [], fixedCounts = [], bothCounts = [], noinfoCounts = [];

  var shutdownsByYear = shutdowns.byYear.slice();
  shutdownsByYear.sort(function (a,b) {
    return a.year - b.year;
  }).forEach(function (d) {
    labels.push(d.year);
    var mobile = 0,
        fixed = 0,
        both = 0,
        noinfo = 0;
    d.shutdowns.forEach(function (shutdown) {
      switch (shutdown.networksAffected) {
        case "mobile":
          mobile += 1;
          break;
        case "fixed":
          fixed += 1;
          break;
        case "both":
          both += 1;
          break;
        default:
          noinfo += 1;
          console.log("undefined");
          break;
      }
    })
    mobileCounts.push(mobile);
    fixedCounts.push(fixed);
    bothCounts.push(both);
    noinfoCounts.push(noinfo);
    counts.push(d.shutdowns.length);
  });

  var yearlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mobile',
        data: mobileCounts,
        backgroundColor: 'red'
      },{
        label: 'Fixed Line',
        data: fixedCounts,
        backgroundColor: 'green'
      },{
        label: 'Both networks',
        data: bothCounts,
        backgroundColor: 'yellow'
      },{
        label: 'No Information',
        data: noinfoCounts,
        backgroundColor: 'grey'
      }]
    },
    options: {
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      }
    }
  });
}


},{}]},{},[1]);
