var { TextureLoader } = require('three');
var blank = require('./blank');

var rand = ( from = 0, to = 1 ) => from + Math.floor( Math.random() * ( to - ( from - 1 ) ) );
var sample = arr => arr[ rand( 0, arr.length - 1 ) ];
var sampleObj = obj => obj[ sample( Object.keys( obj ) ) ];

var lists, queues = [];
var updateList = () => fetch( 'names/manifest.json' )
    .then( r => r.json() )
    .then( r => lists = r );

var loader = new TextureLoader();
var load = paths => paths.map( path => loader.load( path ) );

updateList().then(() => {
    queues = lists.map( list => {
        var queue = [];
        for ( var i = 0; i < 5; i++ ) queue.push( load( sampleObj( list ) ) );
        return queue;
    });
    setInterval( updateList, 1000 * 60 );
})

module.exports = ( size, depth = 0 ) => {
    var queue = queues[ depth ] || [];
    var object = blank( size );
    if ( queue.length ) {
        var [ bump, emissive ] = queue.shift();
        object.material.emissiveMap = emissive;
        object.material.emissive.set( 0xaaaaaa );
        object.material.bumpMap = bump;
        object.material.needsUpdate = true;
        object.addEventListener( 'removed', () => {
            bump.dispose();
            emissive.dispose();
        })
        queue.push( load( sampleObj( lists[ depth ] ) ) );
    }
    object.name = 'name';
    return object;
}