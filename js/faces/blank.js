var { ParametricGeometry, PlaneGeometry, Shape, ExtrudeGeometry, Mesh } = require('three');
var wrap = require('canvas-text-wrapper').CanvasTextWrapper;
var material = require('../material');

module.exports = size => {
    var geometry = new PlaneGeometry( size.x, size.y, 128, 64 );
    var ratio = size.y / size.x;
    var marginY = ( 1 - size.y ) / 2;
    geometry.faceVertexUvs[ 0 ].forEach( uvs => uvs.forEach( uv => {
        uv.y = uv.y * ratio + marginY;
    }))
    var mesh = new Mesh( geometry, material() );
    mesh.name = 'blank';
    return mesh;
}