var fs = require('fs');
var path = require('path');
var config = require('../config');
var extract_text = require('../extract_text/extract_text');

var file_path = config.searchInputFile;
var url = "http://"

module.exports = function (robot) {
	robot.hear(
		/https?:\/\/[\S]*/i,
		(res) => {
			var timestamp = (new Date().getTime() / 1000);
			var value = res.match[0] + ", " + timestamp.toString() + "\n";

			append_file(file_path, value);
		}
	);

	robot.respond(
		/!slackbot/i, 
		(res) => {
			res.reply(url);
		}
	);
}

function append_file(file, string){
	fs.appendFile(file, string, function (err) {
		if (err) throw err;
	});
}