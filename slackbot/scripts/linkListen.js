var fs = require('fs');
var path = require('path');

var json_path = path.join(__dirname, '..', 'scripts', 'logs');
var file_name = 'links.txt'
var file_path = json_path + "\\" + file_name

module.exports = function (robot) {
	robot.hear(
		/https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i,
		(res) => {
			var timestamp = (new Date().getTime() / 1000);
			var value = res.match[0] + ", " + timestamp.toString() + "\n";
			
			appendFile(file_path, value);
		}
	);
}

function appendFile(file, string){
	fs.appendFile(file, string, function (err) {
		if (err) throw err;
	});
}