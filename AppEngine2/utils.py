#!/usr/bin/env python

import string
from html2text import HTML2Text
import re
from HTMLParser import HTMLParser


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
    return '\n'.join(otherContents)

def convertHtmlToWords2(content):
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

def convertHtmlToWords(content):
    h = HTML2Text()
    h.ignore_links = True
    h.ignore_images = True
    h.ignore_emphasis = True
    return h.handle(content)

def getWordCount(plaintext):
    return len(re.findall(r'\w+', plaintext))

def getPlainText(bodys):
    if not bodys:
        return (False, "NO Content")
    # plain
    pat = r'\b(([\w-]+://?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^%s\s]|/)))' % re.escape(string.punctuation)
    for body in bodys:
        content = body['content']
        if body['type'] == 'text/plain' and \
                content is not None and content != '':
            content = re.sub(pat, ' ', content)
            return (False, stripQuotation(content))

    # html
    for body in bodys:
        content = body['content']
        if content is not None and content != '':
            return (True, stripQuotation(convertHtmlToWords(content)))


