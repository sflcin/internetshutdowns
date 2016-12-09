'use strict';
var DATADIR = __dirname + '/../../public/data';
var states = require(DATADIR + '/india_states.json');
var shutdowns = require(DATADIR + '/old-shutdowns.json');

states.features = states.features.map(function (state) {
    state.properties.shutdowns = 0;
    shutdowns.features.forEach(function (shutdown) {
        if (state.properties.name.indexOf(shutdown.properties.state) > -1) {
            state.properties.shutdowns += 1;
        }
    });
    return state;
});

console.log(JSON.stringify(states, null, 2));
