var fs = require('fs');
var filepath = "C:\\Users\\liferay\\Desktop\\me\\slackbot\\slackbot\\scripts\\logs\\links.txt";

// https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
module.exports = function (robot) {
	robot.hear(
		/https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i,
		(res) => {
			var timestamp = (new Date().getTime() / 1000);
			var value = res.match[0] + ", " + timestamp.toString() + "\n";
			appendFile(filepath, value);
		}
	);
}

function appendFile(file, string){
	fs.appendFile(file, string, function (err) {
		if (err) throw err;
	});
}