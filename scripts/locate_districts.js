'use strict';
var DATADIR = __dirname + '/../public/data';
var districts = require(DATADIR + '/india_district.json');
var shutdowns = require(DATADIR + '/shutdowns.json');
var turfCentroid = require('turf-centroid');

var collection = [];
for (var s = 0; s < shutdowns.features.length; s++) {
    var d, district;
    var shutdown = shutdowns.features[s];
    var newFeature;
    if (shutdown.properties.locality.length > 0) {
        for (var l = 0; l < shutdown.properties.locality.length; l++) {
            newFeature = JSON.parse(JSON.stringify(shutdown));
            var locality = shutdown.properties.locality[l];
            for (d = 0; d < districts.features.length; d++) {
                district = districts.features[d];
                if ((locality.indexOf(district.properties.NAME_2) > -1 || district.properties.NAME_2.indexOf(locality) > -1) ||
                (district.properties.VARNAME_2 && (locality.indexOf(district.properties.VARNAME_2) > -1 || district.properties.VARNAME_2.indexOf(locality) > -1)) &&
                (shutdown.properties.state.indexOf(district.properties.NAME_1) > -1 || district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                    newFeature.geometry = turfCentroid(district.geometry).geometry;
                    newFeature.properties.locality = locality;
                    collection.push(newFeature);
                    break;
                } else if ((shutdown.properties.state.indexOf(district.properties.NAME_1) > -1) || (district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                    newFeature.geometry = turfCentroid(district.geometry).geometry;
                    newFeature.properties.locality = locality;
                    collection.push(newFeature);
                    break;
                }
            }
        }
    } else {
        newFeature = JSON.parse(JSON.stringify(shutdown));
        for (d = 0; d < districts.features.length; d++) {
            district = districts.features[d];
            if ((shutdown.properties.state.indexOf(district.properties.NAME_1) > -1) || (district.properties.NAME_1.indexOf(shutdown.properties.state) > -1)) {
                newFeature.geometry = turfCentroid(district.geometry).geometry;
                newFeature.properties.locality = '';
                collection.push(newFeature);
                break;
            }
        }
    }
}


collection = collection.map(function (feature) {
    feature.properties.count = collection.filter(function (f) {
        return feature.properties.locality ? (f.properties.locality === feature.properties.locality) : (f.properties.state === feature.properties.state);
    }).length;
    return feature;
});

shutdowns.features = collection;
console.log(JSON.stringify(shutdowns, null, 2));
