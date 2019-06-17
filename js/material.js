var {
    Texture,
    Color,
    MeshStandardMaterial,
    DoubleSide,
    TextureLoader
} = require('three');
var config = require('./config');

var loader = new TextureLoader();

var color = new Color().setHSL( 0., .8, .5 );

// var norms = {
//     flat: loader.load('maps/norm-flat.jpg'),
//     bumpy: loader.load('maps/norm-bumpy.jpg'),
//     rough: loader.load('maps/norm-rough.jpg')
// }

var colors = [0xff4955, 0xff4955,0xff4955,0x45c7dd,0x003cff];

var rand = ( from = 0, to = 1 ) => from + Math.floor( Math.random() * ( to - ( from - 1 ) ) );
var sample = arr => arr[ rand( 0, arr.length - 1 ) ];

var bump = loader.load('maps/brick-bump.jpg')
var map = loader.load('maps/diffuse.jpg')

module.exports = () => new MeshStandardMaterial({
    // color: config.color,
    map,
    roughness: .9,
    metalness: .2,
    bumpScale: .07,
    bumpMap: bump,
})