'use strict';
var DATADIR = __dirname + '/../public/data';
var districts = require(DATADIR + '/india_district.json');
var shutdowns = require(DATADIR + '/shutdowns.json');
var turfCentroid = require('turf-centroid');
shutdowns.features = shutdowns.features.map(function (shutdown) {
    // console.log(shutdown.properties.state, ' ', shutdown.properties.locality);
    // var shutdown = shutdowns.features[0];
    var features = [];
    if (shutdown.properties.locality.length) {
        shutdown.properties.locality.forEach(function (locality) {
            for (var d = 0; d < districts.features.length; d++) {
                var district = districts.features[d];
                if (
                (locality.indexOf(district.properties.NAME_2) > -1 || district.properties.NAME_2.indexOf(locality) > -1) ||
                (district.properties.VARNAME_2 && (locality.indexOf(district.properties.VARNAME_2) > -1 || district.properties.VARNAME_2.indexOf(locality) > -1)) &&
                (shutdown.properties.state.indexOf(district.properties.NAME_1) > -1 || district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                    shutdown.geometry = turfCentroid(district.geometry).geometry;
                    shutdown.properties.locality = locality;
                    features.push(shutdown);
                    break;
                } else if ((shutdown.properties.state.indexOf(district.properties.NAME_1) > -1) || (district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                    shutdown.geometry = turfCentroid(district.geometry).geometry;
                    shutdown.properties.locality = locality;
                    features.push(shutdown);
                    break;
                }
            }
        });
    } else if (!shutdown.properties.locality.length) {
        districts.features.forEach(function (district) {
            if ((shutdown.properties.state.indexOf(district.properties.NAME_1) > -1) || (district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                shutdown.geometry = turfCentroid(district.geometry).geometry;
                features.push(shutdown);
                return;
            }
        });
    }
    return features;
});

shutdowns.features.forEach(function (feature, featureIndex) {
    if (Array.isArray(feature)) {
        feature.forEach(function (individualFeature) {
            shutdowns.features.push(individualFeature);
        });
        shutdowns.features.splice(featureIndex, 1);
    }
});

console.log(JSON.stringify(shutdowns, null, 2));
