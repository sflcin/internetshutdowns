'use strict';
var DATADIR = __dirname + '/../data';
var districts = require(DATADIR + '/india_district.json');
var shutdowns = require(DATADIR + '/shutdowns.json');

shutdowns.features = shutdowns.features.map(function (shutdown) {
    if (shutdown.properties.locality.length) {
        districts.features.forEach(function (district) {
            if ((shutdown.properties.locality.indexOf(district.properties.NAME_2) > -1 || district.properties.NAME_2.indexOf(shutdown.properties.locality) > -1) || (district.properties.VARNAME_2 && (shutdown.properties.locality.indexOf(district.properties.VARNAME_2) > -1 || district.properties.VARNAME_2.indexOf(shutdown.properties.locality) > -1)) && (shutdown.properties.state.indexOf(district.properties.NAME_1) > -1 || district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                shutdown.geometry = district.geometry;
                return;
            }
        });
    } else if (!shutdown.properties.locality.length || !Object.keys(shutdown.properties).length) {
        districts.features.forEach(function (district) {
            if ((shutdown.properties.state.indexOf(district.properties.NAME_1) > -1) || (district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                shutdown.geometry = district.geometry;
                return;
            }
        });
    }
    return shutdown;
});

console.log(JSON.stringify(shutdowns, null, 2));
