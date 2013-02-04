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
from google.appengine.ext.webapp.util import login_required
from google.appengine.ext.webapp import template
import settings
from contextIO2 import ContextIO, Message
import contextIO2
from django.utils import simplejson as json
import random

import imapoauth

###### Compute thread reading time

import threading
from HTMLParser import HTMLParser

class CtxIOConn(object):
    ctxIOConsumerKey = settings.CONTEXTIO_OAUTH_KEY
    ctxIOSecretKey = settings.CONTEXTIO_OAUTH_SECRET
    instance = None
    lock = threading.Lock()
    def __init__(self):
	self.ctxIO = ContextIO(
            consumer_key = CtxIOConn.ctxIOConsumerKey, 
            consumer_secret = CtxIOConn.ctxIOSecretKey)
    @staticmethod
    def getInstance():
	if (CtxIOConn.instance is not None):
	    return CtxIOConn.instance
	else:
	    CtxIOConn.lock.acquire()
	    ret = CtxIOConn.instance
	    if (ret is None):
		ret = CtxIOConn()
		CtxIOConn.instance = ret
	    CtxIOConn.lock.release()
	    return ret

def stripPlainTextSignature(content):
    return content.rsplit('--', 1)[0].rstrip('\n\r -')

def stripQuotation(content):
    lines = content.splitlines()
    numQuotationBlocks = 0
    isPrevLineQuotation = False
    otherContents = []
    for line in lines:
        if line != "" and line[0] == '>':
            if not isPrevLineQuotation:
                isPrevLineQuotation = True
                numQuotationBlocks += 1
        else:
            isPrevLineQuotation = False
            if line != "":
                otherContents.append(line)
    return numQuotationBlocks, ' '.join(otherContents)

def plainTextReadingTime((numQuotationBlocks, otherContents)):
    return (numQuotationBlocks + len(otherContents.split())), otherContents.split()

def convertHtmlToWords(content):
    class MyHtmlParser(HTMLParser):
        def __init__(self):
            HTMLParser.__init__(self)
            self.words = []
            self.tagStack = [("document", [], True)]
        def handle_starttag(self, tag, attrs):
            isTextData = (tag != "style" and tag != "script")
            self.tagStack.append((tag, attrs, isTextData))
        def handle_endtag(self, tag):
            if len(self.tagStack) > 1:
                del self.tagStack[-1]
        def handle_data(self, data):
            if self.tagStack[-1][2]:
                self.words += data.split()
    parser = MyHtmlParser()
    parser.feed(content)
    return parser.words

def htmlReadingTime(words):
    return len(words), words

def getReadingTimeAndContent(bodys):
    # plain
    for body in bodys:
        content = body['content']
        if body['type'] == 'text/plain' and \
                content is not None and content != '':
            return plainTextReadingTime(stripQuotation(
                    stripPlainTextSignature(content))) + (content,)

    # html
    for body in bodys:
        content = body['content']
        if content is not None and content != '':
            return htmlReadingTime(convertHtmlToWords(content)) + (content,)


def getThreadReadingTime(thread_id):
        ctxIO = CtxIOConn.getInstance().ctxIO
        idValue = "510f38fd3f757ef81f000000"
        thrdIDValue = thread_id
        thread = contextIO2.Account(ctxIO, {'id' : idValue}) \
            .get_message_thread('gm-' + thrdIDValue, **{'include_body' : True})

        totTime = 0
        for message in thread['messages']:
            bodys = message['body']
            time, words, content = getReadingTimeAndContent(bodys)
            """
            self.response.write(time)
            self.response.write('\n')
            self.response.write(words)
            self.response.write('\n')
            self.response.write(content)
            self.response.write('\n\n#############################################\n\n')
            """
            totTime += time
        return totTime / 5.0

###################

################### auth

def checkIfOAuthComplete(emailAddr):
    ctxIOId = None
    
    """
    gmailIDs = db.GqlQuery("SELECT * "
                           "FROM CtxIOGmailID "
                           "WHERE email_addr = :1 AND "
                           "ANCESTOR IS :2 ",
                           emailAddr,
                           ctxIOGmailIDGqlParentKey(emailAddr))

    for gmailID in gmailIDs:
        ctxIOId = gmailID.ctx_io_id
        break
    if ctxIOId is None:
    """

    ctxIO = CtxIOConn.getInstance().ctxIO
    accounts = ctxIO.get_accounts(**{'email' : emailAddr})
    for account in accounts:
        ctxIOId = account.id
        break
    if ctxIOId is None:
        return False
        
    # test if we can access the email account by this
    # ctxIOId. Grab a valid access token when necessary.
    tokens = ctxIO.get_account_connect_tokens(ctxIOId)
    validToken = None
    for token in tokens:
        if token.used > 0:
            validToken = token.token
            break
    return (validToken is not None)

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
                gIdList2 = map(lambda x: "%d:%.2d" % (x / 60, x % 60), map(getThreadReadingTime, gIdList))
                self.response.out.write(json.dumps(gIdList2))
            else:
                self.response.out.write("[]")
        elif entityType == 'User':
            result = {"userID" : 1,
                      "email" : email,
                      "orgKey" : "orgKey",
                      "creationTimestamp" : "0",
                      "lastUpdatedTimestamp" : "1",
                      "lastSeenTimestamp" : "2",
                      "lastSeenClientVersion" : "5.10",
                      "lastSeenExtVersion" : "5.0",
                      "lastSeenBrowser" : "Chrome",
                      "userSettings" : {"value" : {"leftLink" : {"open" : True}}},
                      "isOauthComplete" : checkIfOAuthComplete(email),
                      "userKey" : "userKey",
                      "displayName" : email,
                      "key" : "key",
                      "experiments": {}
                      }
            self.response.out.write(json.dumps(result))
        else:
            self.response.out.write("[]")

class VersionHandler(webapp.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        self.response.out.write(r"""{"suggestedExtVersion":"3.0","suggestedClientVersion":"3.42"}""")


class LogHandler(webapp.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        self.response.out.write(r"")

class OAuthStart(webapp.RequestHandler):
    def get(self):
        # redirect to access granting page
        template_values = {
            'connect_link': '/imapoauth_step1'
            }
        path = os.path.join(os.path.dirname(__file__), 'templates', 'connect.html')
        self.response.out.write(template.render(path, template_values))            

def main():
    application = webapp.WSGIApplication(
        [('/ajaxcalls/getEntities', MainHandler), 
         ('/ajaxcalls/logClientError', LogHandler), 
         ('/ajaxcalls/setRandomCookie', LogHandler),
         ('/ajaxcalls/checkSuggestedVersions', VersionHandler),
         ('/oauth/start', OAuthStart),
         ('/imapoauth_step1', imapoauth.Fetcher),
         ('/imapoauth_step2', imapoauth.RequestTokenCallback)], 
        debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
