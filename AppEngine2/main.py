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
import wsgiref.handlers
import cgi, os, md5, logging
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
import settings
from contextIO2 import ContextIO
from django.utils import simplejson as json

class MainHandler(webapp.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        entityType = self.request.get('entityType')
        email = self.request.get('email')
        if entityType == 'EstimatedTime':
            hexGmailThreadIdList = self.request.get('hexGmailThreadIdList')
            if hexGmailThreadIdList:
                gIdList = json.loads(hexGmailThreadIdList)
                self.response.out.write(json.dumps(gIdList))
            else:
                self.response.out.write("[]")
        elif entityType == 'User':
            self.response.out.write(r"""{"userId":1,"email":"hupo001@gmail.com","orgKey":"agxzfm1haWxmb29nYWVyIwsSDE9yZ2FuaXphdGlvbiIRaHVwbzAwMUBnbWFpbC5jb20M","creationTimestamp":"1359721200347","lastUpdatedTimestamp":"1359878999598","lastSeenTimestamp":"1359878400000","lastSeenClientVersion":"5.10","lastSeenExtVersion":"5.0","lastSeenBrowser":"Chrome","userSettings":{"value":"{\"leftLink\":{\"open\":true}}"},"isOauthComplete":true,"userKey":"agxzfm1haWxmb29nYWVyLQsSDE9yZ2FuaXphdGlvbiIRaHVwbzAwMUBnbWFpbC5jb20MCxIEVXNlchgBDA","displayName":"hupo001@gmail.com","key":"agxzfm1haWxmb29nYWVyLQsSDE9yZ2FuaXphdGlvbiIRaHVwbzAwMUBnbWFpbC5jb20MCxIEVXNlchgBDA","experiments":{}}""")
        else:
            self.response.out.write("[]")


class LogHandler(webapp.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        self.response.out.write("")

def main():
    application = webapp.WSGIApplication([('/ajaxcalls/getEntities', MainHandler), 
        ('/ajaxcalls/logClientError', LogHandler), 
         ('/ajaxcalls/setRandomCookie', LogHandler)], debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
