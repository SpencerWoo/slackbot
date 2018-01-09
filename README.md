# Create a Slack App

1. Navigate to https://api.slack.com/apps
2. Click the 'Create New App' button
3. Give your app a name and choose the Slack workspace you wish to use

# OAuth and Permissions

1. Navigate to https://api.slack.com/apps
2. Select the app you created from the list of apps
3. From the left menu, choose Oauth & Permissions
4. Under scopes, add the following: ``bot``, ``channels:history``, ``channels:read``, ``groups:history``, ``groups:read``
5. Sign into Slack as your regular user and add the created bot user to all the channels you wish for it to record

# Download the Existing History

1. Navigate to https://api.slack.com/apps
2. Select the app you created from the list of apps
3. From the left menu, choose "Install App"
4. Copy the "OAuth Access Token" (it should start with ``xoxp-``)
5. Navigate to the root of this repository and run the following commands:

``` bash
cd slackHistory
HUBOT_SLACK_TOKEN=${your.oauth.access.token} ./pullSlackHistory.py
```

# Create a config.js

1. Create a file inside of the ``slackbot`` folder named ``config.js``
2. Inside of that file, add the following content, replacing your username and password with the proper values:

``` javascript
var path = require('path');

exports.liferayUsername = '';
exports.liferayPassword = '';

exports.extractLiferayContent = false;
exports.searchInputFile = path.join(__dirname, 'scripts', 'logs', 'links.txt');
exports.searchOutputFile = path.join(__dirname, 'html', 'search.json');
```

# Run the Slackbot

1. Navigate to https://api.slack.com/apps
2. Select the app you created from the list of apps
3. From the left menu, choose "Install App"
4. Copy the "Bot User OAuth Access Token" (it should start with ``xoxb-``)
5. Navigate to the root of this repository and run the following commands:

``` bash
cd slackbot
HUBOT_SLACK_TOKEN=${your.bot.user.oauth.access.token} bin/hubot --adapter slack
```