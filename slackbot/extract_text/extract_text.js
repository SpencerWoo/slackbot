const assert = require('assert');
const bunyan = require('bunyan');
const fs = require('fs');
const readline = require('readline');
const tail = require('tail');

const requestGrowContent = require('../extract_text/extract_grow').requestGrowContent;
const requestLoopContent = require('../extract_text/extract_loop').requestLoopContent;
const requestOtherContent = require('../extract_text/extract_other').requestOtherContent;

const config = require('../config');

assert(config.searchInputFile);
assert(config.searchOutputFile);

let searchURLs = new Set();

const logger = bunyan.createLogger({
	name: 'metadata',
	streams: [{
		path: config.searchOutputFile
	}]
});

const initialize = () => {
	if (fs.existsSync(config.searchOutputFile)) {
		let outputReader = readline.createInterface({
			input: fs.createReadStream(config.searchOutputFile)
		});

		outputReader.on('line', (line) => {
			if (!line) {
				return;
			}

			let locationMetadata = JSON.parse(line);
			searchURLs.add(locationMetadata['location']);
		})
	}

	let inputReader = readline.createInterface({
		input: fs.createReadStream(config.searchInputFile)
	});

	inputReader.on('line', (line) => {
		let locationData = line.split(',');

		if (locationData.length < 2) {
			return;
		}

		requestContent(locationData[0], locationData[1]);
	})

	let tailing = new tail.Tail(config.searchInputFile);

	tailing.on('line', (line) => {
		let locationData = line.split(',');
		requestContent(locationData[0], locationData[1]);
	})
}

const recordContent = (location, timestamp, title, content) => {
	if (!title) {
		title = location;
	}

	let locationMetadata = {
		'location': location,
		'timestamp': timestamp,
		'title': title,
		'content': content
	};

	logger.info(locationMetadata);
}

const requestContent = (location, timestamp) => {
	if (searchURLs.has(location)) {
		return;
	}

	location = location.trim();
	timestamp = timestamp.trim();

	searchURLs.add(location);

	let callback = recordContent.bind(null, location, timestamp);

	if (location.indexOf('https://grow.liferay.com/') == 0) {
		requestGrowContent(location, callback);
	}
	else if (location.indexOf('https://loop.liferay.com/') == 0) {
		requestLoopContent(location, callback);
	}
	else {
		requestOtherContent(location, callback);
	}
}

initialize();

exports.requestContent = requestContent;