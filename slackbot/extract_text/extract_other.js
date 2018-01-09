const cheerio = require('cheerio');
const http = require('http');
const https = require('https');
const urlParse = require('url').parse;

const getRequestOptions = (location, method) => {
	console.log(location);

	let url = urlParse(location);

	return {
		'host': url.host,
		'method': method || 'GET',
		'path': url.pathname + url.search,
		'port': url.port || (url.protocol == 'https:' ? 443 : 80),
		'protocol': url.protocol,
		'searchParams': url.searchParams
	}
}

const requestOtherContent = (location, callback) => {
	let options = getRequestOptions(location);
	let agent = options.protocol == 'https:' ? https : http;

	agent.request(
		options,
		(res) => {
			if (res.statusCode == 302) {
				return;
			}

			let responseBuffer = [];

			res.on('data', (data) => {
				responseBuffer.push(data);
			});

			res.on('end', () => {
				let responseBody = responseBuffer.join('');

				let $ = cheerio.load(responseBody);

				let title = $('title').text();
				let content = $.text();

				callback(title, content.replace(/\s+/g, ' '));
			});
		}
	).end();
}

exports.requestOtherContent = requestOtherContent;