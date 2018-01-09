const cheerio = require('cheerio');
const config = require('../config');
const requestLiferayContent = require('./extract_liferay').requestLiferayContent;

const requestLoopFeed = (location, callback) => {
	let feedId = location.substring(location.lastIndexOf('/') + 1);

	requestLiferayContent(location, () => {
		let authTokenURL = 'https://loop.liferay.com/api/jsonws?contextPath=/loop-portlet&signature=%2Floop-portlet%2Ffeed%2Fview-1-id';

		requestLiferayContent(authTokenURL, (responseBody) => {
			let $ = cheerio.load(responseBody);

			let authToken = $('#execute input[name="p_auth"]').attr('value');

			var jsonURL = 'https://loop.liferay.com/api/jsonws/loop-portlet.feed/view/id/' + feedId + '?p_auth=' + authToken;

			requestLiferayContent(jsonURL, (apiCallResultText) => {
				let apiCallResult = JSON.parse(apiCallResultText);
				let payload = JSON.parse(apiCallResult['data']['payload']);

				let $ = cheerio.load(payload['message']);
				let creator = payload['creator']['emailAddress'];
				creator = creator.substring(0, creator.indexOf('@'));

				let message = $.text();

				callback(creator, message.replace(/\s+/g, ' '));
			});
		});
	});
}

const requestLoopContent = (location, callback) => {
	if (!config.extractLiferayContent) {
		callback('', '');
		return;
	}

	if (location.indexOf('/-/loop/feed/') != -1) {
		requestLoopFeed(location, callback);
	}
	else {
		callback('', '');
	}
};

exports.requestLoopContent = requestLoopContent;