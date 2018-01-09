const assert = require('assert');
const cheerio = require('cheerio');
const CookieManager = require('cookie-manager');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
const urlParse = require('url').parse;

const config = require('../config');

assert(config.liferayUsername != null);
assert(config.liferayPassword != null);

const cm = new CookieManager();

const setCookie = (options, headers) => {
	let cookie = headers['set-cookie'];

	if (cookie) {
		cm.store(options.protocol + '//' + options.host + '/', cookie);
	}
}

const getRequestOptions = (location, method) => {
	console.log(location);

	let url = urlParse(location);

	var cookie = cm.prepare(location);

	return {
		'headers': cookie ? { 'cookie': cookie } : {},
		'host': url.host,
		'method': method || 'GET',
		'path': url.pathname + url.search,
		'port': url.port || (url.protocol == 'https:' ? 443 : 80),
		'protocol': url.protocol,
		'searchParams': url.searchParams
	}
}

const authenticate = (location, callback) => {
	let options = getRequestOptions(location);
	let agent = options.protocol == 'https:' ? https : http;

	agent.request(
		options,
		(res) => {
			setCookie(options, res.headers);

			if (res.statusCode == 302) {
				authenticate(res.headers['location'], callback);

				return;
			}

			let portletId = options.searchParams.get('p_p_id');

			let responseBuffer = [];

			res.on('data', (data) => {
				responseBuffer.push(data);
			});

			res.on('end', () => {
				let responseBody = responseBuffer.join('');

				if (responseBody.indexOf('SAMLRequest') != -1) {
					submitSAMLRequest(responseBody, callback);
				}
				else {
					submitLoginForm(portletId, responseBody, callback);
				}
			});
		}
	).end();
}

const submitSAMLRequest = (responseBody, callback) => {
	let $ = cheerio.load(responseBody);

	let formAction = $('form').attr('action');

	let formItems = {};

	$('form input').each((i, x) => {
		formItems[$(x).attr('name')] = $(x).attr('value');
	});

	var options = getRequestOptions(formAction, 'POST');
	options.headers['content-type'] = 'application/x-www-form-urlencoded';

	let agent = options.protocol == 'https:' ? https : http;

	var req = agent.request(options, (res) => {
		setCookie(options, res.headers);

		if (res.statusCode == 302) {
			authenticate(res.headers['location'], callback);
		}
		else {
			callback();
		}
	});

	req.write(querystring.stringify(formItems));
	req.end();
}

const submitLoginForm = (portletId, responseBody, callback) => {
	let namespace = '_' + portletId + '_';

	let $ = cheerio.load(responseBody);

	let formId = '#' + namespace + 'loginForm';
	let formAction = $(formId).attr('action');

	if (!formAction) {
		formId = '#' + namespace + 'fm';
		formAction = $(formId).attr('action');
	}

	let formItems = {};

	$(formId + ' input').each((i, x) => {
		formItems[$(x).attr('name')] = $(x).attr('value');
	});

	formItems[namespace + 'login'] = config.liferayUsername;
	formItems[namespace + 'password'] = config.liferayPassword;

	var options = getRequestOptions(formAction, 'POST');
	options.headers['content-type'] = 'application/x-www-form-urlencoded';

	let agent = options.protocol == 'https:' ? https : http;

	var req = agent.request(options, (res) => {
		setCookie(options, res.headers);

		if (res.statusCode == 302) {
			followLoginRedirect(res.headers['location'], callback);
		}
		else {
			callback();
		}
	});

	req.write(querystring.stringify(formItems));
	req.end();
}

const followLoginRedirect = (location, callback) => {
	let options = getRequestOptions(location);
	let agent = options.protocol == 'https:' ? https : http;

	agent.request(
		options,
		(res) => {
			if (res.statusCode == 302) {
				followLoginRedirect(res.headers['location'], callback);

				return;
			}

			let responseBuffer = [];

			res.on('data', (data) => {
				responseBuffer.push(data);
			});

			res.on('end', () => {
				let responseBody = responseBuffer.join('');

				if (responseBody.indexOf('SAMLResponse') != -1) {
					submitSAMLResponse(responseBody, callback);
				}
				else {
					callback();
				}
			});
		}
	).end();
}

const submitSAMLResponse = (responseBody, callback) => {
	let $ = cheerio.load(responseBody);

	let formAction = $('form').attr('action');

	let formItems = {};

	$('form input').each((i, x) => {
		formItems[$(x).attr('name')] = $(x).attr('value');
	});

	var options = getRequestOptions(formAction, 'POST');
	options.headers['content-type'] = 'application/x-www-form-urlencoded';

	let agent = options.protocol == 'https:' ? https : http;

	var req = agent.request(options, (res) => {
		setCookie(options, res.headers);

		if (res.statusCode == 302) {
			followLoginRedirect(res.headers['location'], callback);
		}
		else {
			callback();
		}
	});

	req.write(querystring.stringify(formItems));
	req.end();
}

const requestLiferayContent = (location, callback) => {
	let options = getRequestOptions(location);
	let agent = options.protocol == 'https:' ? https : http;

	agent.request(
		options,
		(res) => {
			setCookie(options, res.headers);

			if (res.statusCode == 302) {
				authenticate(res.headers['location'], () => {
					requestLiferayContent(location, callback);
				});

				return;
			}

			let responseBuffer = [];

			res.on('data', (data) => {
				responseBuffer.push(data);
			});

			res.on('end', () => {
				let responseBody = responseBuffer.join('');

				callback(responseBody);
			});
		}
	).end();
}

exports.requestLiferayContent = requestLiferayContent;