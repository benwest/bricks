var { CanvasTexture } = require('three');
var dirs = require('./utils/dirs');
var { UP, DOWN, facesCamera } = dirs;
var wrap = require('canvas-text-wrapper').CanvasTextWrapper;
var { RATIO } = require('./config');
var randomName = require('./names');

var TEX_SIZE = 1024;

var createTexture = ( name, dir ) => {
    var size = dir === UP || dir === DOWN
        ? [ TEX_SIZE, TEX_SIZE * RATIO * RATIO ]
        : [ TEX_SIZE, TEX_SIZE * RATIO ];
    var canvas = document.createElement('canvas');
    canvas.width = Math.floor( size[ 0 ] );
    canvas.height = Math.floor( size[ 1 ] );
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );
    ctx.fillStyle = 'white';
    wrap( canvas, name.toUpperCase(), {
        font: `${ Math.floor( size[ 0 ] / 12 ) }px Helvetica`,
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingX: size[ 0 ] / 12
    })
    // deboss( ctx );
    var tex = new CanvasTexture( canvas );
    tex.name = name;
    return tex;
}

module.exports = ( brick, excludeFront = true ) => {
    dirs.order.forEach(( dir, i ) => {
        if ( excludeFront && facesCamera( brick, dir ) ) return;
        var mat = brick.renderObject.material[ i ];
        mat.emissiveMap = createTexture( randomName(), dir );
        mat.needsUpdate = true;
    })
    return brick;
}
