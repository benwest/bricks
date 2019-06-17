var { Euler, Quaternion } = require('three');
var { UV_UP } = require('./config');
var {
    LEFT,
    BACKWARD,
    DOWN,
    cameraFacingDirectionIdx,
    sameDirection,
    getWorldDirection
} = require('./utils/dirs');
var tween = require('./utils/tween');

var lerp = ( a, b, t ) => a + ( b - a ) * t;

var rand = ( from = 0, to = 1 ) => from + Math.floor( Math.random() * ( to - ( from - 1 ) ) );
var sample = arr => arr[ rand( 0, arr.length - 1 ) ];
var randAngle = () => rand( -3, 3 ) * Math.PI / 2;
var randEuler = () => new Euler( randAngle(), randAngle(), randAngle() );
var randAxisQuat = () => {
    var q = new Quaternion();
    var a = Math.PI * ( Math.random() > .5 ? -.5 : .5 );
    var dir = sample([ DOWN, BACKWARD, LEFT ]);
    q.setFromAxisAngle( dir, a );
    return q;
}
var addEulers = ( e1, e2 ) => {
    e1.x += e2.x;
    e1.y += e2.y;
    e1.z += e2.z;
    return e1;
};

var filteredRandom = ( fn, filter, max = 100 ) => {
    for ( var i = 0; i < max; i++ ) {
        var res = fn();
        if ( filter( res ) ) return res;
    }
    return res;
}

module.exports = brick => {
    // var from = brick.rotation.clone();
    var from = brick.quaternion.clone();
    var fromDirIdx = cameraFacingDirectionIdx( brick );
    var to = filteredRandom(() => {
        return from.clone().multiply( randAxisQuat() );
        // return addEulers( from.clone(), randAxisEuler() )
    }, to => {
        brick.rotation.copy( to );
        brick.quaternion.copy( to );
        var toDirIdx = cameraFacingDirectionIdx( brick );
        // if ( fromDirIdx === toDirIdx ) return false;
        if ( sameDirection( getWorldDirection( brick, UV_UP[ toDirIdx ] ), DOWN ) ) return false;
        return true;
    })
    // console.log( to );
    // brick.rotation.copy( from );
    brick.quaternion.copy( from );
    return tween({ duration: 2000, easing: 'linear', onProgress: t => {
        Quaternion.slerp( from, to, brick.quaternion, t );
        // brick.rotation.x = lerp( from.x, to.x, t );
        // brick.rotation.y = lerp( from.y, to.y, t );
        // brick.rotation.z = lerp( from.z, to.z, t );
    }}).then( () => brick );
}