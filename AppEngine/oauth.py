#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

from contextIO2 import ContextIO, Account
from google.appengine.api import users
from oauth2client.appengine import CredentialsModel, StorageByKeyName
from oauth2client.client import OAuth2WebServerFlow
import logging
import json
import webapp2
import settings
from model import User

# Create an instance of the DocsService to make API calls

def createFlow(request_handler, user_email):
  flow = OAuth2WebServerFlow(client_id = settings.APPENGINE_CONSUMER_KEY,
                            client_secret = settings.APPENGINE_CONSUMER_SECRET,
                            scope = ['https://mail.google.com', 
                              'https://www.googleapis.com/auth/userinfo.profile', 
                              'https://www.googleapis.com/auth/userinfo.email'],
                            redirect_uri = 'https://%s/oauth/callback' % request_handler.request.host,
                            approval_prompt = 'force',
                            state = user_email 
                            )
  return flow

class CallbackHandler(webapp2.RequestHandler):
  def get(self):
    error = self.request.get('error')
    if error:
      errormsg = self.request.get('error_description', error)
      self.response.out.write(
        'The authorization request failed: %s' % errormsg)
    else:
      user_email = str(self.request.get('state'))
      redirect_uri = 'https://%s/oauth/grantAccess/%s/' % (self.request.host, user_email)
      if user_email:
        flow = createFlow(self, user_email)
        credentials = flow.step2_exchange(self.request.params)
        StorageByKeyName(CredentialsModel, user_email, 'credentials').put(credentials)
      else:
        logging.error('no user_email in state')
      self.redirect(redirect_uri)

class GrantAccessHandler(webapp2.RequestHandler):
  def get(self, user_email):
    flow = createFlow(self, user_email)
    credentials = StorageByKeyName(CredentialsModel, user_email, 'credentials').get()
    force = self.request.get('force')
    if force and force == 'true':
        self.redirect(flow.step1_get_authorize_url()) 
        return
    
    if credentials:
      user = User.get_by_key_name(user_email)
      if not user or not user.is_oauth_complete:
        ctxIO = ContextIO(consumer_key=settings.CONTEXTIO_OAUTH_KEY, 
                          consumer_secret=settings.CONTEXTIO_OAUTH_SECRET)
        current_account = ctxIO.post_account(email=user_email)
        user = User.get_or_insert(key_name = user_email, 
                                  user_ctx_id=current_account.id,
                                  email=user_email)
        refresh_token = credentials.refresh_token
        try:
          if not refresh_token:
            raise Exception('no refresh token')
          current_account.post_source(email=user_email,
                                             username=user_email,
                                             server='imap.gmail.com',
                                             provider_refresh_token=refresh_token,
                                             provider_consumer_key=settings.APPENGINE_CONSUMER_KEY)
        except Exception as e:
          logging.error(str(e))
          self.redirect(flow.step1_get_authorize_url())
        user.is_oauth_complete = True
        user.put()
      self.response.out.write(r"""<html><head><script type="text/javascript">window.close();</script></head><body><div id="sbi_camera_button" class="sbi_search" style="left: 0px; top: 0px; position: absolute; width: 29px; height: 27px; border: none; margin: 0px; padding: 0px; z-index: 2147483647; display: none;"></div></body></html>""")
    else:
      logging.info('redirect')
      self.redirect(flow.step1_get_authorize_url()) 

app = webapp2.WSGIApplication([('/oauth/grantAccess/(.+@.+\..+)/', GrantAccessHandler),
                               ('/oauth/callback', CallbackHandler)],
                             debug=True)
