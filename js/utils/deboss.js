var square = radius => {
    var points = [];
    for ( var i = -radius; i < radius; i++ ) {
        points.push( [ i, 0 ] )
        points.push( [ i, radius ] )
        points.push( [ 0, i ] )
        points.push( [ radius, i ] )
    }
    return points;
}

module.exports = ctx => {
    var { width, height } = ctx.canvas;
	var src = ctx.getImageData( 0, 0, width, height );
	var dst = ctx.createImageData( width, height );
	var inRange = ( x, y ) => (
	    x >= 0 && y >= 0 && x < width && y < height
	)
	var idx = ( x, y ) => ( y * width + x ) * 4
	var search = ( x, y, radius = 1 ) => {
	    var d = square( radius ).find(([ ox, oy ]) => {
	        return (
	            inRange( x + ox, y + oy ) &&
	            src.data[ idx( x + ox, y + oy ) ] < 128
            );
	    })
	    if ( d ) {
	        return Math.atan2( d[ 1 ], d[ 0 ] );
	    } else {
	        return search( x, y, radius + 1 );
	    }
	}
	for ( var i = 0; i < width * height * 4; i += 4 ) {
	    dst.data[ i + 2 ] = 255;
	    dst.data[ i + 3 ] = 255;
	}
	var write = ( x, y, a ) => {
	    var i = idx( x, y );
	    dst.data[ i ] = Math.floor( Math.sin( a ) * 128 + 128 );
	    dst.data[ i + 1 ] = Math.floor( Math.cos( a ) * 128 + 128 );
	}
	for ( var y = 0; y < height; y++ ) {
	    for ( var x = 0; x < width; x++ ) {
	        if ( src.data[ idx( x, y ) ] > 128 ) {
	            write( x, y, search( x, y ) );
	        }
	    }
	}
	ctx.putImageData( dst, 0, 0 );
}