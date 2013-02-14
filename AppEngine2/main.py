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
from google.appengine.ext import deferred
from google.appengine.runtime import DeadlineExceededError

import datetime
import wsgiref.handlers
import md5, logging
import webapp2
import settings
from contextIO2 import ContextIO
import contextIO2
import random
import json
import traceback

from model import User, Thread, Message
from utils import getPlainText, getWordCount, stripPlainTextSignature
import threading

class ContextIOConn(object):
    ctxioConsumerKey = settings.CONTEXTIO_OAUTH_KEY
    ctxioSecretKey = settings.CONTEXTIO_OAUTH_SECRET
    instance = None
    lock = threading.Lock()
    def __init__(self):
        self.ctxio = ContextIO(
            consumer_key = ContextIOConn.ctxioConsumerKey, 
            consumer_secret = ContextIOConn.ctxioSecretKey)
    @staticmethod
    def getInstance():
        if ContextIOConn.instance:
            return ContextIOConn.instance
        else:
            ContextIOConn.lock.acquire()
            ret = ContextIOConn.instance
            if ret is None:
                ret = ContextIOConn()
            ContextIOConn.instance = ret
            ContextIOConn.lock.release()
            return ret

def estimateReadingTime(message):
    if message.is_sent:
        return 0
    elif message.has_unsubscribe:
        return message.word_count * 100
    elif 'edu' in message.addresses:
        return message.word_count * 200
    else:
        return message.word_count * 200

def processReadingThread(user_ctx_id, user_email, thread_ids):
    ctxio = ContextIOConn.getInstance().ctxio
    account = contextIO2.Account(ctxio, {'id' : user_ctx_id})
    index = 0
    try:
        for index, thread_id in enumerate(thread_ids):
            thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id, user_email = user_email)
            if thread.is_processed:
                continue
            if not thread.is_queued:
                continue

            thread_data = account.get_message_thread('gm-' + thread_id, include_body=True)
            thread.last_date = 0
            for message_data in thread_data['messages']:
                message_id = message_data['gmail_message_id']
                message = Message.get_or_insert(key_name = message_id, message_id = message_id, thread_id=thread_id, user_email=user_email)
                if not message.is_processed:
                    plain_text = getPlainText(message_data['body'])
                    message.word_count = getWordCount(stripPlainTextSignature(plain_text))
                    message.addresses = json.dumps(message_data['addresses'])
                    message.date = message_data['date']
                    message.is_sent = '\\Sent' in message_data['folders']
                    message.has_unsubscribe = 'unsubscribe' in plain_text.lower()
                    message.is_processed = True
                    message.put()            
                if message.date > thread.last_date:
                    thread.last_date = message.date
                    thread.last_message_id = message_id
                    thread.estimated_reading_time = estimateReadingTime(message)
            thread.is_queued = False
            thread.is_processed = True
            thread.put()
    except DeadlineExceededError:
        deferred.defer(processReadingThread, user_ctx_id, user_email, thread_ids[index:], _queue='reading-queue', _target='crawler')
    except Exception as e:
        logging.error(str(e))
        raise e
    
class ThreadReset(webapp2.RequestHandler):
    def get(self):
        for thread in Thread.gql('WHERE is_processed = FALSE AND is_queued = TRUE'):
            thread.is_queued = False
            thread.put()
            self.response.out.write('%s reset + \n' % thread.thread_id)

class ThreadDeferrer(webapp2.RequestHandler):
    def get(self):
        email = self.request.get('email')
        thread_ids = json.loads(self.request.get('thread_ids'))
        user = User.get_by_key_name(key_names = email)
        for index, thread_id in enumerate(thread_ids):
                thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id, user_email = email)
                thread.is_queued = True
                thread.is_processed = False

                thread.put()
        deferred.defer(processReadingThread, user.user_ctx_id, email, thread_ids, _queue='reading-queue', _target='crawler')

class ThreadReader(webapp2.RequestHandler):
    def get(self):
        try:
            email = self.request.get('email')
            thread_ids = json.loads(self.request.get('thread_ids'))
            user = User.get_by_key_name(key_names = email)
            if not user:
                raise Exception('NO such users')
            for index, thread_id in enumerate(thread_ids):
                thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id, user_email = email)
                thread.is_queued = True
                thread.is_processed = False

                thread.put()
            processReadingThread(user.user_ctx_id, email, thread_ids)
            for index, thread_id in enumerate(thread_ids):
                thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id, user_email = email)
                logging.info(str(thread.estimated_reading_time))
                print "%s:%s" % (thread_id, str(thread.estimated_reading_time))

        except Exception as e:
            logging.error(traceback.format_exc(e))

class UpdateHandler(webapp2.RequestHandler):
    def get(self):
        self.post()

    def post(self):
        entityType = self.request.get('entityType')
        email = self.request.get('email')
        if entityType == 'ReadingTime':
            thread_id = self.request.get('threadId')
            elapsed_time = self.request.get('elapsedTime')

            if not thread_id or not elapsed_time:
                return
            try:
                elapsed_time = int(elapsed_time)
            except:
                return

            thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id, user_email = email)
            thread.reading_time += elapsed_time
            thread.put()
            self.response.out.write('totaltime for %s: %s' % (thread_id, thread.reading_time))

class GetHandler(webapp2.RequestHandler):
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
                    for thread_id in tid_list:
                        if thread_id:
                            thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id, user_email = email)
                            if thread.is_processed:
                                results.append(str(thread.estimated_reading_time))
                            else:
                                if not thread.is_queued:
                                    thread.is_queued = True
                                    thread.put()
                                    processReadingThread(user_ctx_id, email, [thread_id])
                                    #deferred.defer(processReadingThread, user_ctx_id, email, [thread_id], _queue='reading-queue', _target='crawler')
                                results.append("-1")
                        else:
                            results.append(None)
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
        self.response.out.write(r"""{"suggestedExtVersion":"3.0","suggestedClientVersion":"3.42","Lime-Time-GAE":"%s"}""" % settings.APPENGINE_CONSUMER_KEY)


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
        [('/ajaxcalls/getEntities', GetHandler), 
         ('/ajaxcalls/logClientError', LogClientErrorHandler), 
         ('/ajaxcalls/setRandomCookie', SetRandomCookieHandler),
         ('/ajaxcalls/checkRandomCookie', CheckRandomCookieHandler),
         ('/ajaxcalls/checkSuggestedVersions', VersionHandler),
         ('/ajaxcalls/updateEntity', UpdateHandler),
         ('/worker/threadReader', ThreadReader),
         ('/worker/threadReset', ThreadReset),
         ('/worker/threadDeferrer', ThreadDeferrer),
         ], 
        debug=True)
