var { TextureLoader } = require('three');
var blank = require('./blank')
var config = require('../config');

var loader = new TextureLoader();

var emissiveMap = loader.load('maps/DANK-JE-WEL_emissive.jpg');
var bumpMap = loader.load('maps/DANK-JE-WEL_bump.jpg');

module.exports = size => {
    var object = blank( size );
    object.material.bumpMap = bumpMap;
    object.material.emissiveMap = emissiveMap;
    object.material.emissive.set( 0x888888 )
    object.material.needsUpdate = true;
    object.name = 'dankjewel';
    return object;
}