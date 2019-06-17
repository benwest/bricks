var dirs = require('./utils/dirs');
var { RATIO } = require('./config');
var { Quaternion } = require('three');

var eq = ( x, y ) => Math.abs( x - y ) < .001;

var getDepthZ = depth => {
    var z = 0;
    var d = ( 1 / 2 - Math.pow( RATIO, 3 ) / 2 );
    for ( var i = 0; i < depth; i++ ) {
        z += d;
        d *= RATIO;
    }
    return z;
}

var depthObjs = ( brick, d ) => brick.children.slice( d * 6, ( d + 1 ) * 6 )

var getForwardFace = brick => {
    var objs = depthObjs( brick, brick.depth );
    var dots = objs.map( obj => {
        var quat = obj.getWorldQuaternion( new Quaternion );
        return dirs.FORWARD.clone().applyQuaternion( quat ).dot( dirs.FORWARD );
    });
    return objs[ dots.indexOf( Math.max( ...dots ) ) ];
}

var setDepth = ( brick, depth ) => {
    var face = getForwardFace( brick ).children[ 0 ];
    depthObjs( brick, brick.depth ).forEach( o => o.remove( o.children[ 0 ] ))
    brick.depth = depth;
    getForwardFace( brick ).add( face );
    brick.position.z = getDepthZ( depth );
}

var veq = ( v1, v2 ) => eq( v1.dot( v2 ), 1 );
var parallel = ( v1, v2 ) => eq( Math.abs( v1.dot( v2 ) ), 1 );

var hasHoles = obj => (
    obj.children.length &&
    obj.children[ 0 ].name === 'holes'
)

module.exports = brick => {
    if ( hasHoles( getForwardFace( brick ) ) ) return;
    if ( brick.depth > 0 && parallel( brick.getFaceNormal( 4 ), dirs.FORWARD ) ) {
        console.log( 'up' )
        setDepth( brick, brick.depth - 1 );
    } else if ( brick.depth < brick.maxDepth && parallel( brick.getFaceNormal( 1 ), dirs.FORWARD ) ) {
        console.log( 'doon' )
        setDepth( brick, brick.depth + 1 );
    }
}