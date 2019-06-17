var { Vector3, Quaternion } = require('three');

var RIGHT = new Vector3( 1, 0, 0 );
var LEFT = new Vector3( -1, 0, 0 );
var UP = new Vector3( 0, 1, 0 );
var DOWN = new Vector3( 0, -1, 0 );
var BACKWARD = new Vector3( 0, 0, 1 );
var FORWARD = new Vector3( 0, 0, -1 )
var order = [ RIGHT, LEFT, UP, DOWN, BACKWARD, FORWARD ];

var absSameDirection = ( v1, v2 ) => v1.cross( v2 ).length() < .25;
var sameDirection = ( v1, v2 ) => v1.dot( v2 ) > .75;
var match = v => order.find( dir => sameDirection( v, dir ) );
var facesCamera = ( brick, dir ) => sameDirection( getWorldDirection( brick, dir ), BACKWARD )
var cameraFacingDirection = brick => order.find( ( dir, i ) => facesCamera( brick, dir ) );
var cameraFacingDirectionIdx = brick => order.indexOf( cameraFacingDirection( brick ) )
var getWorldDirection = ( brick, direction ) =>
    direction.clone().applyQuaternion( brick.getWorldQuaternion( new Quaternion() ) );
    
module.exports = {
    RIGHT,
    LEFT,
    UP,
    DOWN,
    FORWARD,
    BACKWARD,
    order,
    absSameDirection,
    sameDirection,
    match,
    facesCamera,
    cameraFacingDirection,
    cameraFacingDirectionIdx,
    getWorldDirection
};