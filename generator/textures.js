var fs = require('fs-extra');
var child_process = require('child_process');
var { createCanvas, registerFont } = require('canvas');
var wrap = require('canvas-text-wrapper').CanvasTextWrapper;
var slugify = require('slugify');
var sheet = require('./sheet');

var SIZE = 1024;
var MANIFEST = 'names/manifest.json';

registerFont( 'fonts/Arial Bold.ttf', { family: 'Arial' });

var exec = cmd => new Promise( resolve => child_process.exec( cmd, resolve ) );

var emissive = ( text, file ) => new Promise( resolve => {
    var canvas = createCanvas( SIZE, SIZE );
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );
    ctx.fillStyle = 'white';
    wrap( canvas, text, {
        font: '85px Arial',
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingX: 87
    })
    canvas
        .pngStream()
        .pipe( fs.createWriteStream( file ) )
        .on( 'finish', resolve )
})
var bump = ( inFile, outFile ) => exec([
    'convert',
    inFile,
    '-negate',
    `-morphology Distance Euclidean:4,'3!'`,
    '-negate',
    '-modulate 15',
    'maps/brick-bump.jpg',
    '+swap',
    '-compose Minus_Src',
    '-quality 60',
    `-composite '${ outFile }'`,
].join(' '))

var cleanup = async ( names, record ) => {
    console.log( record );
    for ( var name in record ) {
        if ( !names.includes( name ) ) {
            await fs.unlink( record[ name ][ 0 ] );
            await fs.unlink( record[ name ][ 1 ] );
            delete record[ name ];
            console.log( 'Deleted ' + name );
        }
    }
    return record;
}

var generate = async ( text, dir = 'names' ) => {
    console.log( 'Rendering ' + text );
    text = text.toUpperCase();
    var filename = slugify( text );
    var bumpFile = `${ dir }/${ filename }_bump.jpg`;
    var emissiveFile = `${ dir }/${ filename }_emissive.jpg`;
    await emissive( text, emissiveFile )
    await bump( emissiveFile, bumpFile )
    return [ bumpFile, emissiveFile ];
}

var update = async () => {
    var manifest = await fs.exists( MANIFEST )
        ? JSON.parse( await fs.readFile( MANIFEST, 'utf8' ) )
        : [];
    var lists = await sheet.get();
    for ( var i = 0; i < lists.length; i++ ) {
        if ( !manifest[ i ] ) manifest[ i ] = {};
        var list = lists[ i ];
        var record = manifest[ i ];
        await cleanup( list, record );
        var newNames = list.filter( name => !( name in record ) );
        for ( var name of newNames ) {
            record[ name ] = await generate( name );
            await fs.writeFile( MANIFEST, JSON.stringify( manifest ), 'utf8' );
        }
    }
    console.log( 'Done' );
}

var generateHandDisp = ( outFile = 'maps/hand_disp.jpg' ) => exec([
    'convert',
    'maps/hand.png',
    '-background black',
    '-gravity Center',
    '-geometry 450',
    `-morphology Distance Euclidean:4,'150!'`,
    '-level 0%,100%,2.0',
    '-extent 1024x1024',
    '-negate',
    outFile
].join(' '))
var generateHandBump = ( outFile = 'maps/hand_bump.jpg' ) => exec([
    'convert',
    'maps/hand.png',
    '-gravity Center',
    '-geometry 450',
    `-morphology Distance Euclidean:4,'150!'`,
    '-level 0%,100%,2.0',
    // '-negate',
    'maps/brick-bump.jpg',
    '+swap',
    '-compose Minus_Src',
    '-quality 60',
    `-composite '${ outFile }'`,
].join(' '))
var generateHand = async () => {
    await generateHandDisp()
    await generateHandBump()
}

// generateHand();
// generate('DANK JE WEL', 'maps')

( async () => {
    console.log('Checking for names')
    await sheet.init();
    update();
})();