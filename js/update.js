var { Vector3, Quaternion } = require('three');
var createStack = require('./stack');
var dirs = require('./utils/dirs');
var faces = require('./faces');
var tween = require('./utils/tween');
var { RATIO } = require('./config');

var PRECISION = .0001

var faceTypes = Object.keys( faces );

var rand = ( from = 0, to = 1 ) => from + Math.floor( Math.random() * ( to - ( from - 1 ) ) );
var sample = arr => arr[ rand( 0, arr.length - 1 ) ];
var omit = ( arr, value ) => arr.filter( x => x !== value );

var pointsBackward = v => v.dot( dirs.BACKWARD ) > PRECISION
var isEmpty = obj => obj.children.length === 0
var hasChildren = obj => !isEmpty( obj );

var addFace = ( obj, existingTypes, depth ) => {
    var types = faceTypes
    if ( existingTypes.includes('holes') ) types = omit( types, 'holes' );
    var face = faces[ 'name' in faces && Math.random() < .8 ? 'name' : sample( types ) ];
    obj.add( face( obj.dir, depth ) );
    var up = dirs.UP.clone().applyQuaternion( obj.getWorldQuaternion( new Quaternion() ) );
    if ( up.dot( dirs.UP ) < 0 ) obj.rotation.z += Math.PI / 2;
}
var removeFace = obj => obj.remove( obj.children[ 0 ] );

module.exports = brick => {
    var quat = brick.getWorldQuaternion( new Quaternion() );
    var visible = [];
    var invisible = [];
    dirs.order.forEach( ( dir, i ) => {
        var d = dir.clone().applyQuaternion( quat );
        if ( pointsBackward( d ) ) {
            visible.push( brick.getFace( i ) )
        } else {
            invisible.push( brick.getFace( i ) )
        }
    })
    visible
        .filter( isEmpty )
        .forEach( obj => {
            var types = visible
                .filter( hasChildren )
                .map( obj => obj.children[ 0 ].name );
            addFace( obj, types, brick.depth )
        });
    invisible
        .filter( hasChildren )
        .forEach( removeFace );
}