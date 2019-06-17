var randomName = require('node-random-name');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
document.body.appendChild( canvas );

var GRID_SIZE = [ 5, 5 ];
var CELL_SIZE = [ 260, 240 ];
var MORTAR = 5;
var FONT = 40;
var COLORS = [ 'white'];

canvas.width = GRID_SIZE[ 0 ] * CELL_SIZE[ 0 ];
canvas.height = GRID_SIZE[ 1 ] * CELL_SIZE[ 1 ];

var rand = ( min, max, step = 1 ) => {
    if ( max === undefined ) {
        max = min;
        min = 0;
    }
    return min + Math.floor( ( Math.random() * ( max - min ) ) / step ) * step;
}
var sample = arr => arr[ rand( arr.length ) ];

var scales = [
    // ...Array( 1000 ).fill( 1 / 16 ),
    ...Array( 10 ).fill( 1 / 8 ),
    ...Array( 10 ).fill( 1 / 4 ),
    ...Array( 5 ).fill( 1 / 2 ),
    ...Array( 3 ).fill( 1 / 1 )
];

var eq = ( v1, v2 ) => v1[ 0 ] === v2[ 0 ] && v1[ 1 ] === v2[ 1 ];
var sameBrick = ( brick1, brick2 ) => eq( brick1.position, brick2.position ) && eq( brick1.size, brick2.size )

var bricks = [];

var create = scale => {
    var maxRow = GRID_SIZE[ 1 ] / scale;
    var row = rand( maxRow );
    var maxColumn = ( GRID_SIZE[ 0 ] / scale ) - ( row % 2 ? 2 : 3 );
    var column = rand( row % 2 ? 1 : 0, maxColumn, 2 );
    var name = randomName();
    var textSize = FONT * scale;
    return {
        position: [ column * scale, row * scale ],
        size: [ scale * 2, scale ],
        name,
        textSize,
        age: 0,
        color: sample( COLORS ),
    };
}

var drawBrick = brick => {
    ctx.fillStyle = brick.color
    ctx.fillRect(
        brick.position[ 0 ] * CELL_SIZE[ 0 ] + MORTAR / 2,
        brick.position[ 1 ] * CELL_SIZE[ 1 ] + MORTAR / 2,
        brick.size[ 0 ] * CELL_SIZE[ 0 ] - MORTAR,
        brick.size[ 1 ] * CELL_SIZE[ 1 ] - MORTAR,
    );
    ctx.fillStyle = 'black';
    ctx.font = brick.textSize + 'px Basis';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText( brick.name,
        ( brick.position[ 0 ] + brick.size[ 0 ] / 2 ) * CELL_SIZE[ 0 ],
        ( brick.position[ 1 ] + brick.size[ 1 ] / 2 ) * CELL_SIZE[ 1 ]
    )
}

var intersects = (
    { position: [ x1, y1 ], size: [ w1, h1 ] },
    { position: [ x2, y2 ], size: [ w2, h2 ] }
) => !(
    x2 >= x1 + w1 ||
    x2 + w2 <= x1 ||
    y2 >= y1 + h1 ||
    y2 + h2 <= y1
);

var add = () => {
    var scale = sample( scales );
    var positions = [];
    for ( var i = 0; i < 100; i++ ) {
        var brick = create( scale );
        var intersections = bricks.filter( brick2 => intersects( brick, brick2 ) );
        if ( intersections.some( brick2 => sameBrick( brick, brick2 ) ) ) continue;
        if ( intersections.length === 0 ) {
            bricks.push( brick )
            return;
        }
        positions.push({ brick, intersections })
    }
    var ages = positions.map( ({ intersections }) => intersections.reduce( ( sum, brick ) => sum + brick.age, 0 ) / intersections.length );
    var oldest = ages.indexOf( Math.max( ...ages ) );
    bricks = bricks.filter( brick => !positions[ oldest ].intersections.includes( brick ));
    bricks.push( positions[ oldest ].brick );
}

var update = () => {
    for ( var i = 0; i < 1; i++ ) add();
    bricks.forEach( brick => brick.age++ )
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    bricks.forEach( drawBrick );
    // requestAnimationFrame( update );
}
// update();
setInterval( update, 500 );