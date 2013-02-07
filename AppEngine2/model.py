#!/usr/bin/env python

from google.appengine.ext import db 

class User(db.Model):
	email = db.StringProperty(required=True)
	user_ctx_id = db.StringProperty(required=True)
	created = db.DateTimeProperty(auto_now_add=True)
	is_oauth_complete = db.BooleanProperty(required=True,default=False)

class Thread(db.Model):
	thread_id = db.StringProperty(required=True)
	user_email = db.StringProperty(required=True)
	is_queued = db.BooleanProperty(required=True, default=False)
	is_processed = db.BooleanProperty(required=True, default=False)
	reading_time = db.IntegerProperty(required=True, default=0)
	
	last_date = db.IntegerProperty()
	last_message_id = db.StringProperty()
	estimated_reading_time = db.IntegerProperty()


class Message(db.Model):
	message_id = db.StringProperty(required=True)
	thread_id = db.StringProperty(required=True)
	user_email = db.StringProperty(required=True)
	is_processed = db.BooleanProperty(required=True, default=False)
	word_count = db.IntegerProperty()
	addresses = db.TextProperty()
	has_unsubscribe = db.BooleanProperty()
	is_sent = db.BooleanProperty()
	date = db.IntegerProperty()
