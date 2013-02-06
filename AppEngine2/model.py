#!/usr/bin/env python

from google.appengine.ext import db 

class User(db.Model):
	email = db.StringProperty(required=True)
	user_ctx_id = db.StringProperty(required=True)
	created = db.DateTimeProperty(auto_now_add=True)
	is_oauth_complete = db.BooleanProperty(required=True,default=False)

class Thread(db.Model):
	thread_id = db.StringProperty(required=True)
	is_processed = db.BooleanProperty(required=True, default=False)
	estimated_reading_time = db.FloatProperty(default=0.0)

class Message(db.Model):
	message_id = db.StringProperty(required=True)
	is_processed = db.BooleanProperty(required=True, default=False)
	estimated_reading_time = db.FloatProperty(default=0.0)
	
