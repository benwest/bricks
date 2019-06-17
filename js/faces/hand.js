var { TextureLoader } = require('three');
var blank = require('./blank')
var config = require('../config');
var createMaterial = require('../material');

var loader = new TextureLoader();

var material = createMaterial();
material.bumpMap = loader.load('maps/hand_bump.jpg');
material.displacementMap = loader.load('maps/hand_disp.jpg');
material.displacementScale = .03;
material.displacementBias = -.03;

module.exports = size => {
    var object = blank( size );
    object.material = material;
    object.name = 'hand';
    return object;
}