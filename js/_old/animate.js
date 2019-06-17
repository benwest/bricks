var rotate = require('./rotate');
var next = require('./next');
var refreshTextures = require('./texture');

var animate = brick => rotate( brick )
    .then( next )
    .then( refreshTextures )
    .then( animate );

module.exports = animate;