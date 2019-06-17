var {
    Vector2,
    Vector3,
    Face3,
    Shape,
    Geometry,
    PlaneGeometry,
    ShapeGeometry,
    LatheGeometry,
    Mesh
} = require('three');
var { RATIO } = require('../config');
var material = require('../material');

var SEGMENTS = 32;

var MARGIN = 1 / 16;
var GUTTER = 1 / 16;
var BEVEL = 1 / 200;

var merge = geos => geos.reduce( ( merged, geo ) => {
    merged.merge( geo );
    return merged;
}, new Geometry() );

var arc = ( center, radius, aFrom, aTo, steps ) => {
    var vs = [];
    for ( var i = 0; i < steps; i++ ) {
        var a = aFrom + ( aTo - aFrom ) * ( i / ( steps - 1 ) );
        vs.push( new Vector2(
            center.x + Math.cos( a ) * radius,
            center.y + Math.sin( a ) * radius
        ));
    }
    return vs;
}

var corner = ( radius, depth, bevel ) => {
    var shape = new Shape();
    shape.absarc( 0, 0, radius, 0, Math.PI * .5 );
    shape.lineTo( radius, radius );
    var front = new ShapeGeometry( shape, SEGMENTS / 8 );
    var wall = new LatheGeometry([
        new Vector2( radius - bevel, depth ),
        new Vector2( radius - bevel, bevel * 1.1 ),
        new Vector2( radius - bevel, bevel ),
        ...arc( new Vector2( radius, bevel ), bevel, Math.PI, Math.PI * 1.5, 3 )
    ], SEGMENTS / 4, 0, Math.PI / 2 )
    wall.rotateX( Math.PI / -2 );
    front.merge( wall, undefined );
    return front;
}

var hole = ( cx, cy, radius, depth, bevel ) => {
    var corners = [];
    for ( var i = 0; i < 4; i++ ) {
        var c = corner( radius, depth, bevel );
        c.rotateZ( i * Math.PI * .5 );
        corners.push( c );
    }
    var h = merge( corners );
    h.translate( cx, cy, 0 );
    return h;
}

var plane = ([ x, y, w, h ]) => {
    var g = new PlaneGeometry( w, h );
    g.translate( x + w / 2, y + h / 2 )
    return g;
    var g = new Geometry();
    g.vertices.push(
        new Vector3( x, y, 0 ),
        new Vector3( x, y + h, 0 ),
        new Vector3( x + w, y + h, 0 ),
        new Vector3( x + w, y, 0 )
    );
    g.faces.push(
        new Face3( 0, 2, 1 ),
        new Face3( 3, 2, 0 )
    )
    return g;
};

var planes = ps => merge( ps.map( plane ) );

var margin = ( size, width ) => planes([
    [ 0, 0, width.x, size.y ],
    [ size.x - width.x, 0, width.x, size.y ],
    [ width.x, 0, size.x - width.x * 2, width.y ],
    [ width.x, size.y - width.y, size.x - width.x * 2, width.y ]
])

module.exports = size => {
    var grid;
    do {
        grid = new Vector2( Math.random(), Math.random() )
            .multiply( new Vector2( 5, 3 ) )
            .ceil()
    } while ( grid.x === 1 && grid.y === 1 )
    var square = false;
    var justify = grid.x > 1 && grid.y > 1 && Math.random() > .5;
    var gutters = grid.clone().sub( new Vector2( 1, 1 ) );
    var outerSize = new Vector2( size.x, size.y );
    var maxSize = outerSize.clone().sub( new Vector2( MARGIN * 2, MARGIN * 2 ) );
    var minTotalGutter = gutters.clone().multiplyScalar( GUTTER );
    var maxHoleSize = maxSize.clone().sub( minTotalGutter ).divide( grid );
    var holeSize = square
        ? maxHoleSize
        : new Vector2(
            Math.min( maxHoleSize.x, maxHoleSize.y ),
            Math.min( maxHoleSize.x, maxHoleSize.y )
        )
    if ( holeSize.x < BEVEL * 20 || holeSize.y < BEVEL * 20 ) return module.exports( size )
    var totalHoleSize = holeSize.clone().multiply( grid );
    var totalGutter = justify
        ? maxSize.clone().sub( totalHoleSize )
        : minTotalGutter;
    var gutter = totalGutter.clone().divide( gutters );
    var gridSize = totalHoleSize.clone().add( totalGutter );
    var marginWidth = outerSize.clone().sub( gridSize ).multiplyScalar( .5 );
    var p = marginWidth.clone();
    var geometries = [];
    for ( var row = 0; row < grid.y; row++ ) {
        for ( var col = 0; col < grid.x; col++ ) {
            geometries.push( hole(
                p.x + holeSize.x / 2,
                p.y + holeSize.y / 2,
                holeSize.x / 2,
                size.z,
                BEVEL,
                square
            ))
            p.x += holeSize.x;
            if ( col < grid.x - 1 ) {
                geometries.push( plane([ p.x, p.y, gutter.x, holeSize.y ]) );
                p.x += gutter.x;
            }
        }
        p.x = marginWidth.x;
        p.y += holeSize.y;
        if ( row < grid.y - 1 ) {
            geometries.push( plane([ p.x, p.y, gridSize.x, gutter.y ]) )
            p.y += gutter.y;
        }
    }

    var geometry = merge([
        margin( outerSize, marginWidth ),
        ...geometries
    ])
    
    var marginY = ( 1 - size.y ) / 2;
    
    geometry.faceVertexUvs[ 0 ].forEach( ( uvs, i ) => {
        var face = geometry.faces[ i ];
        var v1 = geometry.vertices[ face.a ];
        var v2 = geometry.vertices[ face.b ];
        var v3 = geometry.vertices[ face.c ];
        if ( v1.z === 0 ) uvs[ 0 ].set( v1.x / size.x, marginY + v1.y / size.x );
        if ( v2.z === 0 ) uvs[ 1 ].set( v2.x / size.x, marginY + v2.y / size.x );
        if ( v3.z === 0 ) uvs[ 2 ].set( v3.x / size.x, marginY + v3.y / size.x );
    })
    geometry.uvsNeedUpdate = true;
    geometry.translate( size.x * -.5, size.y * -.5, 0 /*size.z * .5*/ );
    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    var mesh = new Mesh( geometry, material() );
    mesh.name = 'holes';
    return mesh;
}