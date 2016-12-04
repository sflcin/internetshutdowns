'use strict';
var DATADIR = __dirname + '/../data';
var districts = require(DATADIR + '/india_district.json');
var shutdowns = require(DATADIR + '/shutdowns.json');

shutdowns.features = shutdowns.features.map(function (shutdown) {
    if (shutdown.properties.locality.length) {
        districts.features.forEach(function (district) {
            if (shutdown.properties.locality.indexOf(district.properties.NAME_2) > -1 && shutdown.properties.state.indexOf(district.properties.NAME_1) > -1) {
                shutdown.geometry = district.geometry;
            }
        });
    } else {
        districts.features.forEach(function (district) {
            if (shutdown.properties.state.indexOf(district.properties.NAME_1) > -1) {
                shutdown.geometry = district.geometry;
            }
        });
    }
    return shutdown;
});

console.log(JSON.stringify(shutdowns));
