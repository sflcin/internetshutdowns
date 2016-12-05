'use strict';

var DATADIR = __dirname + '/../public/data';
var states  = require(DATADIR + '/india_states.json');
var turfCentroid = require('turf-centroid');
states.features = states.features.map(function (state) {
    state.geometry = turfCentroid(state.geometry).geometry;
    return state;
});

console.log(JSON.stringify(states, null, 2));

