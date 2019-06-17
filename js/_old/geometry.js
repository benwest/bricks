var { Vector2, BoxGeometry } = require('three');
var { RATIO } = require('./config');
var dirs = require('./utils/dirs');

var deg90 = Math.PI / 2;

var UV_ROTATIONS = [
    deg90,
    -deg90,
    0,
    deg90 * 2,
    0,
    0
];

var CENTER = new Vector2( .5, .5 );
var geometry = new BoxGeometry( 1, RATIO, RATIO * RATIO );
geometry.faceVertexUvs[ 0 ].forEach( ( uvs, i ) => {
    var rotation = UV_ROTATIONS[ Math.floor( i / 2 ) ];
    uvs.forEach( uv => uv.rotateAround( CENTER, rotation ));
})

module.exports = geometry;