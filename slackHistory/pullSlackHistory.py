#!/usr/bin/env python

import json
import os
import re, requests

filepath = os.path.join(os.getcwd(), "..", "slackbot", "scripts", "logs")

if not os.path.exists(filepath):
	os.makedirs(filepath)

filename = "links.txt"

# SETUP TOKEN
# Bot User OAuth Access Token
token = os.environ['HUBOT_SLACK_TOKEN']

# CATEGORIES = ["grow.liferay", "web.liferay", "loop.liferay", "stackoverflow", "others", "github"]
def get_channel_ids(channel_type, method, is_private):
	api_url = 'https://slack.com/api/{c}.{m}?token={t}&pretty=1'.format(c=channel_type, m=method, t=token)
	print(api_url)

	response = requests.get(api_url)
	json_data = response.json()

	json_data_key = 'groups' if is_private else 'channels'

	return [group['id'] for group in json_data[json_data_key]]

def pull_slack_history():
	results = {}

	for channel_type, is_private in [('channels', False), ('groups', True)]:
		for channel_id in get_channel_ids(channel_type, 'list', is_private):
			pull_slack_history_for_channel(channel_type, channel_id, results)

	output = '\n'.join(['%s,%s' % (url, ts) for url, ts in results.items()])
	write_file(filepath, filename, output)

def pull_slack_history_for_channel(channel_type, channel_id, results):
	# add error handling
	method = "history"

	latest = 'now'

	while latest is not None:
		if latest == 'now':
			query = "channel=%s" % (channel_id)
		else:
			query = "channel=%s&latest=%s" % (channel_id, latest)

		api_url = 'https://slack.com/api/{c}.{m}?token={t}&pretty=1&{q}'.format(c=channel_type, m=method, t=token, q=query)
		print(api_url)

		response = requests.get(api_url)
		json_data = response.json()

		for message in json_data['messages']:
			text = message['text']
			searchObject = re.search("<(https:\/\/[^\s]+)>", text) #|<(http:\/\/[^\s]+\|)

			if searchObject:
				URL = searchObject.group()[1:-1]

				if URL in results:
					if message['ts'] > results[URL]:
						results[URL] = message['ts']
				else:
					results[URL] = message['ts']

		if not json_data['has_more']:
			latest = None
		else:
			latest = str(min([float(x['ts']) for x in json_data['messages']]))

def write_file(path, name, output):
	try:
		with open(os.path.join(path, name),"w", encoding="UTF-8") as file:
			file.write(output)

		return True
	except IOError:
		return False

pull_slack_history()
