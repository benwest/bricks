var { Matrix4, Quaternion, Euler, Vector3, Object3D } = require('three');
var { RATIO } = require('./config');
var dirs = require('./utils/dirs');

var nextDir = [ 4, 5, 0, 1, 2, 3 ]

var faceTransforms = dirs.order.map( ( dir, i ) => {
    var axis = Math.floor( i / 2 );
    var s = axis === 0 ? RATIO : 1;
    var rz = [ Math.PI / 2, Math.PI / -2, 0, 0, 0, 0 ][ i ];
    var d = [ 1, RATIO, RATIO * RATIO ][ axis ] / 2;
    return new Matrix4()
        .lookAt( dir, new Vector3(), dirs.UP )
        .multiply( new Matrix4().makeTranslation( 0, 0, d ) )
        .scale( new Vector3( s, s, s ) )
        .multiply( new Matrix4().makeRotationZ( rz ) )
})

var shrink = () => {
    return new Matrix4().compose(
        new Vector3(),
        new Quaternion().setFromEuler( new Euler( 0, Math.PI / 2, Math.PI / 2 ) ),
        new Vector3( RATIO, RATIO, RATIO )
    )
}

var eq = ( x, y ) => Math.abs( x - y ) < .001;
var veq = ( v1, v2 ) => eq( v1.dot( v2 ), 1 );
var parallel = ( v1, v2 ) => eq( Math.abs( v1.dot( v2 ) ), 1 );
var perpendicular = ( v1, v2 ) => eq( v1.dot( v2 ), 0 );

module.exports = class Brick extends Object3D {
    constructor ( maxDepth ) {
        super();
        this.depth = 0;
        this.maxDepth = maxDepth;
        var shrunk = new Matrix4();
        for ( var i = 0; i <= maxDepth; i++ ) {
            this.add( ...dirs.order.map( ( dir, dirIndex ) => {
                var obj = new Object3D();
                obj.matrixAutoUpdate = false;
                obj.matrix.copy( shrunk );
                obj.matrix.multiply( faceTransforms[ dirIndex ] )
                obj.dir = dir;
                return obj;
            }))
            shrunk.multiply( shrink() );
        }
    }
    getDir ( dirIdx ) {
        for ( var i = 0; i < this.depth; i++ ) dirIdx = nextDir[ dirIdx ];
        return dirIdx;
    }
    getFace ( dirIdx ) {
        return this.children[ this.depth * 6 + this.getDir( dirIdx ) ];
    }
    getFaceWorldQuat ( faceIdx ) {
        var obj = this.children[ this.depth * 6 + faceIdx ];
        return obj.getWorldQuaternion( new Quaternion );
    }
    getFaceNormal ( faceIdx ) {
        var obj = this.children[ this.depth * 6 + faceIdx ];
        var quat = obj.getWorldQuaternion( new Quaternion );
        return dirs.FORWARD.clone().applyQuaternion( quat );
    }
    getForwardFace () {
        return this.getFace( dirs.order.findIndex( ( dir, i ) => {
            return veq( this.getFaceNormal( i ), dirs.BACKWARD );
        }))
    }
}

// module.exports = depth => {
//     var group = new Object3D();
//     var shrunk = new Matrix4();
//     for ( var i = 0; i < depth; i++ ) {
//         group.add( ...dirs.order.map( ( dir, dirIndex ) => {
//             var obj = new Object3D();
//             obj.matrixAutoUpdate = false;
//             obj.matrix.copy( shrunk );
//             obj.matrix.multiply( faceTransforms[ dirIndex ] )
//             obj.dir = dir;
//             return obj;
//         }))
//         shrunk.multiply( shrink() );
//     }
//     group.depth = 0;
//     return group;
// }

// // var stack = ( maxDepth, matrix = new Matrix4(), depth = 0 ) => {
// //     var group = new Object3D();
// //     group.applyMatrix( matrix )
// //     group.renderObject = new Object3D();
// //     group.renderObject.add( ...faceObjs() )
// //     group.add( group.renderObject );
// //     group.renderObject.visible = false;
// //     group.childObjects = [];
// //     if ( depth < maxDepth ) {
// //         group.childObjects = [
// //             stack( maxDepth, shrink( 1 ), depth + 1 ),
// //             stack( maxDepth, shrink( -1 ), depth + 1 )
// //         ];
// //         group.add( ...group.childObjects );
// //     }
// //     return group;
// // }

// // module.exports = () => {
// //     var root = new Object3D();
// //     root.name = 'root';
// //     root.add( stack( 0 ) );
// //     return root;
// // }