const requestGrowContent = require('../extract_text/extract_grow').requestGrowContent;
const requestLoopContent = require('../extract_text/extract_loop').requestLoopContent;
const requestOtherContent = require('../extract_text/extract_other').requestOtherContent;

const recordContent = (location, timestamp, title, content) => {
	if (!title) {
		title = location;
	}
}

const requestContent = (location, timestamp) => {
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

exports.requestContent = requestContent;