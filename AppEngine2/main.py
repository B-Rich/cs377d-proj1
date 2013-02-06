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
from google.appengine.api import users
from google.appengine.api import taskqueue
from google.appengine.api import memcache
from google.appengine.ext import db 
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp.util import login_required
from google.appengine.ext.webapp import template

import datetime
import wsgiref.handlers
import md5, logging
import webapp2
import settings
from contextIO2 import ContextIO, Message
import contextIO2
import random
import json

from model import User, Thread
from utils import getThreadReadingTime

class ReadingWorker(webapp2.RequestHandler):
    def get(self):
        self.post()
    def post(self): # should run at most 1/s
        user_ctx_id = self.request.get('user_ctx_id')
        thread_id = self.request.get('thread_id')
        
        x = getThreadReadingTime(user_ctx_id, thread_id) / settings.READING_SPEED
        self.response.out.write("%d:%.2d" % (int(x / 60), int(x % 60)))

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        entityType = self.request.get('entityType')
        email = self.request.get('email')
        if entityType == 'EstimatedTime':
            user = User.get_by_key_name(key_names = email)
            if not user:
                self.response.out.write("null")
            else:
                hexGmailThreadIdList = self.request.get('hexGmailThreadIdList')
                if hexGmailThreadIdList:
                    user_ctx_id = user.user_ctx_id
                    tid_list = json.loads(hexGmailThreadIdList)
                    results = []
                    cnt = 0
                    for thread_id in tid_list:
                        thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id)
                        if thread.is_processed:
                            x = thread.estimated_reading_time / settings.READING_SPEED
                            results.append("%d:%.2d" % (int(x / 60), int(x % 60)))
                        else:
                            taskqueue.add(url='/worker/getThreadReadingTime', 
                                params={'user_ctx_id': user_ctx_id, 'thread_id': thread_id},
                                queue_name='reading-queue')
                            results.append("...")
                    self.response.out.write(json.dumps(results))
                else:
                    self.response.out.write("null")
        elif entityType == 'User':
            user = User.get_by_key_name(key_names = email)
            if not user:
                self.response.out.write('null')
            else:
                result = {
                    "userId": user.user_ctx_id,
                    "email": email,
                    "orgKey": "",
                    "creationTimestamp": "1359721200347",
                    "lastUpdatedTimestamp": "1359878999598",
                    "lastSeenTimestamp": "1359878400000",
                    "lastSeenClientVersion": "5.10",
                    "lastSeenExtVersion": "5.0",
                    "lastSeenBrowser": "Chrome",
                    "userSettings": {
                        "value": "{}"
                    },
                    "isOauthComplete": user.is_oauth_complete,
                    "userKey": "",
                    "displayName": email,
                    "key": "",
                    "experiments": {}
                }
                self.response.out.write(json.dumps(result))
        else:
            self.response.out.write("[]")

class VersionHandler(webapp2.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        self.response.out.write(r"""{"suggestedExtVersion":"3.0","suggestedClientVersion":"3.42"}""")


class LogClientErrorHandler(webapp2.RequestHandler):
    def get(self):
        pass

    def post(self):
        pass

class SetRandomCookieHandler(webapp2.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        self.response.headers.add_header("Set-Cookie", 'randomCookie=196;Path=/;Expires=Sat, 06-Apr-14 12:08:46 GMT')
        self.response.out.write(json.dumps({"cookieName":"randomCookie","cookieValue":"196"}))

class CheckRandomCookieHandler(webapp2.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        self.response.out.write(json.dumps({"message":"cookie valid","success":True}))
        
app = webapp2.WSGIApplication(
        [('/ajaxcalls/getEntities', MainHandler), 
         ('/ajaxcalls/logClientError', LogClientErrorHandler), 
         ('/ajaxcalls/setRandomCookie', SetRandomCookieHandler),
         ('/ajaxcalls/checkRandomCookie', CheckRandomCookieHandler),
         ('/ajaxcalls/checkSuggestedVersions', VersionHandler),
         ('/worker/getThreadReadingTime', ReadingWorker)
         ], 
        debug=True)
