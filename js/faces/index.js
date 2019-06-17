var { Vector3, Quaternion, BoxGeometry } = require('three');
var dirs = require('../utils/dirs');
var { RATIO } = require('../config');

var fns = {
    // blank: require('./blank'),
    name: require('./name'),
    // holes: require('./holes'),
    hand: require('./hand'),
    dankjewel: require('./dankjewel')
}

var W = 1;
var H = RATIO;
var D = RATIO * RATIO;

var sizes = new Map();
sizes.set( dirs.LEFT, new Vector3( W, H, W / H ) );
sizes.set( dirs.RIGHT, new Vector3( W, H, W / H ) );
sizes.set( dirs.UP, new Vector3( W, D, H ) );
sizes.set( dirs.DOWN, new Vector3( W, D, H ) );
sizes.set( dirs.FORWARD, new Vector3( W, H, D ) );
sizes.set( dirs.BACKWARD, new Vector3( W, H, D ) );

var wrap = fn => ( dir, depth ) => fn( sizes.get( dir ), depth );

for ( var key in fns ) {
    fns[ key ] = wrap( fns[ key ]);
}

module.exports = fns;

// module.exports = ( dir, fn ) => {
//     if ( fn === undefined ) {
//         fn = Math.random() > .5 ? 'name' : 'holes';
//     }
//     var size = sizes.get( dir );
//     return fns[ fn ]( size );
// }