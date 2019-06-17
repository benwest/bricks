var { Matrix4, Quaternion, Euler, Vector3, Object3D, Mesh } = require('three');
var geometry = require('./geometry');
var holes = require('./bricks/holes');
var material = require('./material');
var texture = require('./texture');
var { RATIO } = require('./config');
var animate = require('./animate');

var shrink = ( dir = 1 ) => {
    return new Matrix4().compose(
        new Vector3( dir * ( 1 / 2 - Math.pow( RATIO, 3 ) / 2 ), 0, 0 ),
        new Quaternion().setFromEuler( new Euler( 0, Math.PI / 2, Math.PI / 2 ) ),
        new Vector3( RATIO, RATIO, RATIO )
    )
}

var brickGroup = ( maxDepth, matrix = new Matrix4(), depth = 0 ) => {
    var group = new Object3D();
    group.applyMatrix( matrix )
    group.renderObject = new Mesh(
        geometry,
        material()
    )
    group.add( group.renderObject );
    group.renderObject.visible = false;
    group.childObjects = [];
    if ( depth < maxDepth ) {
        group.childObjects = [
            brickGroup( maxDepth, shrink( 1 ), depth + 1 ),
            brickGroup( maxDepth, shrink( -1 ), depth + 1 )
        ];
        group.add( ...group.childObjects );
    }
    return group;
}

module.exports = () => {
    var root = new Object3D();
    root.name = 'root';
    var brick = brickGroup( 2 );
    brick.renderObject.visible = true;
    texture( brick, false );
    root.add( brick );
    animate( brick );
    return root;
}