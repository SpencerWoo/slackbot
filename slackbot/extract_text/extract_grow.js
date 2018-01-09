const cheerio = require('cheerio');
const config = require('../config');
const requestLiferayContent = require('./extract_liferay').requestLiferayContent;

const requestGrowContent = (location, callback) => {
	if (!config.extractLiferayContent) {
		let encodedTitle = location.substring(location.lastIndexOf('/') + 1);
		let title = decodeURI(encodedTitle).replace(/\+/g, ' ')

		callback(title, '');
		return;
	}

	requestLiferayContent(location, (responseBody) => {
		let $ = cheerio.load(responseBody);
		let portletId = 'com_liferay_wiki_web_portlet_WikiPortlet';

		let title = null;

		let content = [];

		$('#portlet_' + portletId + ' .wiki-content').children().each((i, x) => {
			if (i == 1) {
				title = $(x).text().trim();
			}
			else if (i >= 3) {
				content.push($(x).text());
			}
		});

		callback(title, content.join(' ').replace(/\s+/g, ' '));
	});
};

exports.requestGrowContent = requestGrowContent;