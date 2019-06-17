var { RATIO } = require('./config');
var geometry = require('./geometry');
var material = require('./material');
var dirs = require('./utils/dirs');
var { LEFT, RIGHT, UP, DOWN, FORWARD, BACKWARD } = dirs;

var {
    Vector2,
    Vector3,
    Euler,
    Quaternion,
    Matrix4,
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    Mesh,
    Object3D,
    DirectionalLight,
} = require('three')
var randomName = require('./names');

var tween = require('./utils/tween');
var drawTexture = require('./texture');

var scene = new Scene();
var camera = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
var renderer = new WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var shrink = ( d = -1 ) => {
    return new Matrix4().compose(
        new Vector3( d * ( 1 / 2 - Math.pow( RATIO, 3 ) / 2 ), 0, 0 ),
        new Quaternion().setFromEuler( new Euler( 0, Math.PI / 2, Math.PI / 2 ) ),
        new Vector3( RATIO, RATIO, RATIO )
    )
}

var brickGroup = ( depth, matrix = new Matrix4() ) => {
    var group = new Object3D();
    group.applyMatrix( matrix )
    group.initialRotation = group.rotation.clone();
    group.add( new Mesh(
        geometry,
        material()
    ))
    if ( depth > 0 ) group.add(
        brickGroup( depth - 1, shrink( 1 ) ),
        brickGroup( depth - 1, shrink( -1 ) )
    )
    return group;
}

var closest = ( point, objs ) => {
    var closest = null;
    var minDist = Infinity;
    objs.forEach( obj => {
        var dist = obj.getWorldPosition( new Vector3() ).sub( point ).length();
        if ( dist < minDist ) {
            minDist = dist;
            closest = obj;
        }
    })
    return closest;
}

var traverse = ( brick, fn ) => {
    fn( brick )
    brick.children.slice( 1 ).forEach( child => traverse( child, fn ) )
}

var light1 = new DirectionalLight( 0xffffff, 1 );
light1.position.z = .5
scene.add( light1 );

var light2 = new DirectionalLight( 0xffffff, .5 );
light2.position.x = 1;
light2.position.y = -.25;
scene.add( light2 );

camera.position.z = 2.5;

var ease = function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t };

var renderObject = brick => brick.children[ 0 ];
var childObjects = brick => brick.children.slice( 1 );

var hide = brick => renderObject( brick ).visible = false;
var show = brick => renderObject( brick ).visible = true;

// var hide = brick => renderObject( brick ).material.opacity = .05;
// var show = brick => renderObject( brick ).material.opacity = .8;

var transferMaterial = ( from, to ) => {
    var fromMat = cameraFacingMaterial( from );
    var toDirIdx = cameraFacingDirectionIdx( to );
    renderObject( to ).material[ toDirIdx ] = fromMat;
}

var UV_UP = [
    dirs.FORWARD,
    dirs.FORWARD,
    dirs.FORWARD,
    dirs.FORWARD,
    dirs.UP,
    dirs.UP
]

var v2d = v3 => new Vector2( v3.x, v3.y );
var alignUVs = ( brick, next ) => {
    var fromDirIdx = cameraFacingDirectionIdx( brick );
    var toDirIdx = cameraFacingDirectionIdx( next );
    var fromUvUp = v2d( getWorldDirection( brick, UV_UP[ fromDirIdx ] ) );
    var toUvUp = v2d( getWorldDirection( next, UV_UP[ toDirIdx ] ) );
    var a = Math.atan2( toUvUp.y, toUvUp.x ) - Math.atan2( fromUvUp.y, fromUvUp.x );
    root.rotation.z -= a;
}

var makeActive = ( prev, next ) => {
    hide( prev );
    transferMaterial( prev, next );
    alignUVs( prev, next );
    show( next );
    return next;
}

var descend = prev => makeActive( prev, closest( camera.position, childObjects( prev )));
var ascend = prev => makeActive( prev, prev.parent );

var lerp = ( a, b, t ) => a + ( b - a ) * t;
var rand = ( from = 0, to = 1 ) => from + Math.floor( Math.random() * ( to - ( from - 1 ) ) );
var randAngle = () => rand( -3, 3 ) * Math.PI / 2;
var randEuler = () => new Euler( randAngle(), randAngle(), randAngle() );
var addEulers = ( e1, e2 ) => {
    e1.x += e2.x;
    e1.y += e2.y;
    e1.z += e2.z;
    return e1;
};

var rotate = brick => {
    var from = brick.rotation.clone();
    var fromDirIdx = cameraFacingDirectionIdx( brick );
    var to = filteredRandom(() => {
        return addEulers( from.clone(), randEuler() )
    }, to => {
        brick.rotation.copy( to );
        var toDirIdx = cameraFacingDirectionIdx( brick );
        if ( fromDirIdx === toDirIdx ) return false;
        if ( sameDirection( getWorldDirection( brick, UV_UP[ toDirIdx ] ), DOWN ) ) return false;
        return true;
    })
    brick.rotation.copy( from );
    return tween({ duration: 10000, onProgress: t => {
        brick.rotation.x = lerp( from.x, to.x, t );
        brick.rotation.y = lerp( from.y, to.y, t );
        brick.rotation.z = lerp( from.z, to.z, t );
    }});
}

var filteredRandom = ( fn, filter, max = 100 ) => {
    for ( var i = 0; i < max; i++ ) {
        var res = fn();
        if ( filter( res ) ) return res;
    }
    return res;
}

var sameDirection = ( v1, v2 ) => v1.dot( v2 ) > .75;
var absSameDirection = ( v1, v2 ) => v1.cross( v2 ).length() < .25;
var getWorldDirection = ( brick, direction ) =>
    direction.clone().applyQuaternion( brick.getWorldQuaternion( new Quaternion() ) );

var canDescend = brick => {
    if ( childObjects( brick ).length === 0 ) return false;
    return absSameDirection( getWorldDirection( brick, RIGHT ), FORWARD );
}

var canAscend = brick => {
    if ( brick.parent === root ) return false;
    return absSameDirection( getWorldDirection( brick, FORWARD ), getWorldDirection( brick.parent, RIGHT ) );
}

var getMaterial = ( brick, i ) => renderObject( brick ).material[ i ];
var facesCamera = ( brick, dir ) => sameDirection( getWorldDirection( brick, dir ), BACKWARD )
var cameraFacingDirection = brick => dirs.order.find( ( dir, i ) => facesCamera( brick, dir ) );
var cameraFacingDirectionIdx = brick => dirs.order.indexOf( cameraFacingDirection( brick ) )
var cameraFacingMaterial = brick => getMaterial( brick, cameraFacingDirectionIdx( brick ) );

var refreshTextures = ( brick, excludeFront = true ) => {
    dirs.order.forEach(( dir, i ) => {
        if ( excludeFront && facesCamera( brick, dir ) ) return;
        var mat = getMaterial( brick, i );
        mat.emissiveMap = drawTexture( randomName(), dir );
        mat.needsUpdate = true;
    })
}

var root = new Object3D();
var curr = brickGroup( 4 );
traverse( curr, hide );
show( curr );
refreshTextures( curr, false )

var container = new Object3D();
container.add( root );
scene.add( container );

root.add( curr );
scene.add( root );

var next = () => {
    if ( canDescend( curr ) ) {
        curr = descend( curr )
    } else if ( canAscend( curr ) ) {
        curr = ascend( curr );
    }
    refreshTextures( curr );
}

var animate = () => rotate( curr ).then( next ).then( animate );

var tick = () => {
    renderer.render( scene, camera );
    requestAnimationFrame( tick );
}

animate();
tick();