var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./google_auth.json');

var doc = new GoogleSpreadsheet('1iVWLigfhqyLBDx7KhhHJy1nZ_qVHj70GGviGYc-FzMA');

var init = () => new Promise( ( resolve, reject ) => doc.useServiceAccountAuth( creds, err => err ? reject( err ) : resolve() ));
var info = () => new Promise( ( resolve, reject ) => doc.getInfo( ( err, res ) => err ? reject( err ) : resolve( res ) ));
var cells = id => new Promise( ( resolve, reject ) => doc.getCells( id, {}, ( err, res ) => err ? reject( err ) : resolve( res )));

var get = async () => {
	var res = [];
	for ( var worksheet of ( await info() ).worksheets.slice( 0, 3 ) ) {
		var names = [];
		for ( var cell of await cells( worksheet.id ) ) {
			names.push( cell.value );
		}
		res.push( names );
	}
	return res;
}

module.exports = { init, get };