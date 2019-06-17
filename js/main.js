var Brick = require('./stack');
var update = require('./update');
var rotate = require('./rotate2');
var next = require('./next2');
var { GUI } = require("dat.gui");
var config = require('./config')

GUI.prototype.addThreeColor=function(obj,varName){
    var dummy={};
    dummy[varName]=obj[varName].getStyle(); 
    return this.addColor(dummy,varName)
        .onChange(function( colorValue  ){
            obj[varName].setStyle(colorValue);
        });
};

// GUI.prototype.addScaler = function ( name, from, to, initial, onChange ) {
//     return this.add({ x: initial }, 'x', from, to ).step( .0001 ).name( name ).onChange( onChange );
// }

// var gui = new GUI();

// gui.add( config, 'multicolor' ).name( 'Multicolor');
// gui.addThreeColor( config, 'color' ).name( 'Color' );
// gui.add( config, 'texture' ).options(['flat', 'bumpy', 'rough'])

var {
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    PointLight,
    AmbientLight,
    DirectionalLight,
    Geometry,
    WireframeGeometry,
    Vector2,
    LineSegments
} = require('three');

var scene = new Scene();
var camera = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
var renderer = new WebGLRenderer({ antialias: true, physicallyCorrectLights: true });

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 2.5;

var brick = new Brick( 2 );
scene.add( brick );

// var light1 = new PointLight( 0xffffee, 1 );
// light1.position.x = 3;
// light1.position.y = 2;
// light1.position.z = 2.5
// light1.decay = 2;
// scene.add( light1 )
// var light2 = new PointLight( 0xaaccff, .3 );
// light2.position.x = -3;
// light2.position.y = -1;
// light2.position.z = 2.5
// light2.decay = 2;
// scene.add( light2 )
// var light3 = new PointLight( 0xffcc00, .4 );
// light3.position.y = 3;
// light3.decay = 2;
// scene.add( light3 )

var light1 = new DirectionalLight( 0xffffee, 1 );
light1.position.x = 3;
light1.position.y = 2;
light1.position.z = 2.5
light1.decay = 2;
scene.add( light1 )
var light2 = new DirectionalLight( 0xaaccff, .3 );
light2.position.x = -3;
light2.position.y = -1;
light2.position.z = 2.5
light2.decay = 2;
scene.add( light2 )
var light3 = new DirectionalLight( 0xffcc00, .4 );
light3.position.y = 3;
light3.decay = 2;
scene.add( light3 )


var amb = new AmbientLight( 0xdddddd );
amb.color.setRGB( .2, .2, .2 );
// scene.add( amb );

var backlight = new PointLight( 0xaaddff, .5 );
backlight.position.set( -2, 2, -2 );
// scene.add( backlight );
// var backlightRadius = 3;
// var backlightZ = -3;
// var backlights = [
//     [ 0, backlightRadius ],
//     [ 0, -backlightRadius ],
//     [ backlightRadius, 0 ],
//     [ -backlightRadius, 0 ],
// ].map( ([ x, y ]) => {
//     var backlight = new PointLight( 0x6666ff, .5 );
//     backlight.position.set( x, y, backlightZ );
//     return backlight;
// })

// var backlight = new PointLight( 0xffffff, .5 );

// var backlight2 = new PointLight( 0xffffff, .5 );
// backlight2.position.z = -3;
// backlight2.position.y = 2;
// scene.add( backlight2 );

// var backlight3 = new PointLight( 0xffffff, .5 );
// backlight3.position.z = -3;
// backlight3.position.x = 2;
// scene.add( backlight3 );

// var backlight4 = new PointLight( 0xffffff, .5 );
// backlight4.position.z = -3;
// backlight4.position.x = -2;
// scene.add( backlight4 );

var animate = () => rotate( brick )
    .then( () => next( brick ) )
    .then( animate )
animate();

var tick = () => {
    // brick.rotation.y += Math.PI / 300;
    // brick.rotation.z += .01;
    update( brick );
    renderer.render( scene, camera );
    requestAnimationFrame( tick );
}

// gui.addScaler( 'Main Light', 0, 1, 1, v => light1.intensity = v );
// gui.addScaler( 'Fill Light', 0, 1, 0, v => amb.color.setRGB( v, v, v ) );

// gui.add( config, 'roughness', 0, 1 ).step( .0001 )
// gui.add( config, 'metalness', 0, 1 ).step( .0001 )
// gui.add( config, 'whiteText' ).name( 'White text')
// gui.close();
tick();