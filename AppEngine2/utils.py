#!/usr/bin/env python

import threading
import settings
from contextIO2 import ContextIO
from HTMLParser import HTMLParser
from model import Thread, Message, User
import contextIO2

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
        if CtxIOConn.instance:
            return CtxIOConn.instance
        else:
            CtxIOConn.lock.acquire()
            ret = CtxIOConn.instance
            if ret is None:
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
    return float(numQuotationBlocks + len(otherContents.split()))

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
    return float(len(words))

def getReadingTimeAndContent(bodys):
    # plain
    for body in bodys:
        content = body['content']
        if body['type'] == 'text/plain' and \
                content is not None and content != '':
            return plainTextReadingTime(stripQuotation(
                    stripPlainTextSignature(content)))

    # html
    for body in bodys:
        content = body['content']
        if content is not None and content != '':
            return htmlReadingTime(convertHtmlToWords(content))


def getThreadReadingTime(user_ctx_id, thread_id):
    thread = Thread.get_or_insert(key_name = thread_id, thread_id = thread_id)
    if thread.is_processed:
        return thread.estimated_reading_time

    ctxIO = CtxIOConn.getInstance().ctxIO
    thread_data = contextIO2.Account(ctxIO, {'id' : user_ctx_id}) \
        .get_message_thread('gm-' + thread_id, **{'include_body' : True})

    totTime = 0
    for message_data in thread_data['messages']:
        message_id = message_data['gmail_message_id']
        message = Message.get_or_insert(key_name = message_id, message_id = message_id)
        if message.is_processed:
            time = message.estimated_reading_time
        else:
            time = getReadingTimeAndContent(message_data['body'])
            message.estimated_reading_time = time
            message.is_processed = True
            message.put()

        totTime += time

    thread.is_processed = True
    thread.estimated_reading_time = totTime
    thread.put()
    return totTime

