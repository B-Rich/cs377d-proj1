import os

local = 'localhost' in os.environ['SERVER_NAME'] 

# Your Context.IO Consumer key and secret used to sign calls to
# https://api.context.io.
#
# To get those keys, create a free account through
# http://context.io/#signup.
#
# If you already have an account, you can retrieve you consumer
# key and secret in the settings tab of the console:
# https://console.context.io/#settings

## Amber's 
CONTEXTIO_OAUTH_KEY = 'njf99jhx'
CONTEXTIO_OAUTH_SECRET = 'P5vRH5H6pH3olkIa'

# Your Google Data API consumer key and secret. These are used
# to obtain access tokens giving the app access to Gmail accounts.
# follow these instructions to obtain them:
# http://code.google.com/apis/accounts/docs/RegistrationForWebAppsAuto.html
#
# Make sure this consumer key and secret are also configured in
# your Context.IO account. You can do this in the settings tab
# of the Context.IO console: 
# https://console.context.io/#settings

if local:
	APPENGINE_CONSUMER_KEY = r'765627927548-3h5jq638ftomt4ah8dktu1mhtb63kud7.apps.googleusercontent.com'
	APPENGINE_CONSUMER_SECRET = r'J2-Ec0jyFQ3jRvtDp2te24tv'
else:
	APPENGINE_CONSUMER_KEY = r'765627927548.apps.googleusercontent.com'
	APPENGINE_CONSUMER_SECRET = r'r4NOg8dzdDeBh_T3WIQBOxIp'

# The name of you App Engine application

APPENGINE_APP_NAME = 'lime-time'

if local:
	DOMAIN = 'localhost'
else:
	DOMAIN = 'lime-time.appspot.com'

