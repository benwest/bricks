var { Vector2, Vector3 } = require('three');
var {
    RIGHT,
    FORWARD,
    absSameDirection,
    getWorldDirection,
    cameraFacingDirectionIdx
} = require('./utils/dirs')
var { UV_UP } = require('./config');

var hide = brick => brick.renderObject.visible = false;
var show = brick => brick.renderObject.visible = true;

var canDescend = brick => {
    if ( brick.childObjects.length === 0 ) return false;
    return absSameDirection( getWorldDirection( brick, RIGHT ), FORWARD );
}

var canAscend = brick => {
    if ( brick.parent.name === 'root' ) return false;
    return absSameDirection( getWorldDirection( brick, FORWARD ), getWorldDirection( brick.parent, RIGHT ) );
}

var transferMaterial = ( from, to ) => {
    var fromDirIdx = cameraFacingDirectionIdx( from );
    var toDirIdx = cameraFacingDirectionIdx( to );
    to.renderObject.material[ toDirIdx ] = from.renderObject.material[ fromDirIdx ];
}

var v2d = v3 => new Vector2( v3.x, v3.y );
var alignUVs = ( brick, next ) => {
    var fromDirIdx = cameraFacingDirectionIdx( brick );
    var toDirIdx = cameraFacingDirectionIdx( next );
    var fromUvUp = v2d( getWorldDirection( brick, UV_UP[ fromDirIdx ] ) );
    var toUvUp = v2d( getWorldDirection( next, UV_UP[ toDirIdx ] ) );
    var a = Math.atan2( toUvUp.y, toUvUp.x ) - Math.atan2( fromUvUp.y, fromUvUp.x );
    var root = next;
    do {
        root = root.parent
    } while ( root.name !== 'root' )
    root.rotation.z -= a;
}

var makeActive = ( prev, next ) => {
    // hide( prev );
    transferMaterial( prev, next );
    alignUVs( prev, next );
    // show( next );
    return next;
}

var descend = prev => {
    var objs = prev.childObjects;
    var zs = objs.map( obj => obj.getWorldPosition( new Vector3() ).z );
    return makeActive( prev, zs[ 0 ] > zs[ 1 ] ? objs[ 0 ] : objs[ 1 ] );
}
var ascend = prev => makeActive( prev, prev.parent );

module.exports = curr => {
    if ( canDescend( curr ) ) {
        return descend( curr )
    } else if ( canAscend( curr ) ) {
        return ascend( curr );
    }
    return curr;
}