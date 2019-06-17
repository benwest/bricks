var { Vector3 } = require('three');
var tween = require('./utils/tween');
var { RATIO } = require('./config');

var DURATION = 3500;

var rand = ( from, to ) => from + Math.floor( Math.random() * ( to - ( from - 1 ) ) );
var sample = arr => arr[ rand( 0, arr.length - 1 ) ];

var speed = depth => new Vector3(
    Math.pow( RATIO, depth + 0 ),
    Math.pow( RATIO, depth + 1 ),
    Math.pow( RATIO, depth + 2 )
).length();


var resetEuler = euler => {
    // console.log( euler );
    // euler.reorder(sample(['XYZ', 'ZXY', 'YZX', 'ZYX']));
    // console.log( euler );
}

module.exports = brick => {
    var velocities = brick.velocities || ( brick.velocities = new Vector3 );
    var stopped = Object.keys( velocities ).every( v => velocities[ v ] === 0 );
    if ( !stopped && Math.random() > .75 ) { // continue
        console.log( 'continue' );
        return Promise.all( Object.keys( velocities ).map( axis => tween({
            from: brick.rotation[ axis ],
            to: brick.rotation[ axis ] + velocities[ axis ] * Math.PI * .5,
            duration: DURATION * speed( brick.depth ),
            onProgress: a => brick.rotation[ axis ] = a
        }))).then( () => resetEuler( brick.rotation ) )
    } else { // change
        console.log('chanage')
        var couldStart = Object.keys( velocities ).filter( v => velocities[ v ] === 0 );
        var willStart = sample( couldStart );
        return Promise.all( Object.keys( velocities ).map( axis => {
            var v = velocities[ axis ];
            var dir, easing;
            if ( v === 0 ) {
                if ( axis !== willStart ) return;
                // start
                dir = Math.random() > .5 ? 1 : -1;
                easing = 'quadIn';
                velocities[ axis ] = dir;
            } else {
                // stop
                dir = v;
                easing = 'quadOut';
                velocities[ axis ] = 0;
            }
            return tween({
                from: brick.rotation[ axis ],
                to: brick.rotation[ axis ] + dir * Math.PI * .5,
                duration: DURATION * speed( brick.depth ) * 2,
                easing,
                onProgress: a => brick.rotation[ axis ] = a
            })
        })).then( () => resetEuler( brick.rotation ) )
    }
}