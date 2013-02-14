
// Only run this script in the top-most frame (there are multiple frames in Gmail)
if(top.document == document) {
	function initMessenger(window){
		// Array Remove - By John Resig (MIT Licensed)
		Array.prototype.remove = function(from, to) {
		  var rest = this.slice((to || from) + 1 || this.length);
		  this.length = from < 0 ? this.length + from : from;
		  return this.push.apply(this, rest);
		};


		var Messenger;
		Messenger = {
			el: null,
			ob_els: {},
			ob_callbacks: {},

		    init: function(cb){
				this.el = document.getElementById("messengerEventPasser");
				if(!this.el){
					this.el = document.createElement('div');
					this.el.setAttribute('id', 'messengerEventPasser');
					this.el.setAttribute('style', 'display:none;');
					document.body.appendChild(this.el);
				}
				if(cb) cb(this);
			},

			observe: function(msgName, cb, id){
				var self = this;
				if(!id){
					id='noid';
				}

				if(!this.ob_els[msgName]){ //initialize listener
					var e = document.createElement('div');
					e.setAttribute('id', msgName + '_eventPasser');
					this.ob_els[msgName] = e;
					this.el.appendChild(e);
				}

				this.ob_els[msgName].addEventListener(msgName, function(e){
					var data = null;
					var kids = self.listToArray(this.childNodes);

					for(var i=0; el = kids[i]; i++){
						var eid = el.getAttribute('id').split('_')[1];

						if(id == 'all' || eid == id){
							var subkids = self.listToArray(el.childNodes);
							var mpEl = subkids[subkids.length - 1];

							try{
								data = JSON.parse(mpEl.innerText);
							}catch(err){
							}

							el.parentNode.removeChild(el); //pop off the stack

							var tCBs = [];
							var len = len=self.ob_callbacks[msgName][id].length;
							for(var j=0; j<len;j++){
								var cb = self.ob_callbacks[msgName][id][j];
								if(!cb.runOnce){
									tCBs.push(cb);
								}
								cb(data, eid);
							}
							if(el){
								el.innerText = '';
							}
							if(self.ob_callbacks[msgName][id]){
								for(var k=len; k<self.ob_callbacks[msgName][id].length;k++){
									tCBs.push(self.ob_callbacks[msgName][id][k]);
								}
							}

							self.ob_callbacks[msgName][id] = tCBs;
						}
					}
				});

				if(!this.ob_callbacks[msgName]) this.ob_callbacks[msgName] = {};
				if(!this.ob_callbacks[msgName][id]) this.ob_callbacks[msgName][id] = [];

				this.ob_callbacks[msgName][id].push(cb);
			},

			unobserve: function(msgName, id){
				delete this.ob_callbacks[msgName][id];
			},

			sendMessage: function(msgName, data, retMsgName, cb, id){
				var cEl = document.getElementById(msgName + '_eventPasser');
				if(cEl){ //make sure someone is 'listening' for event
					if(!id){
						id="noid";
					}

					if(retMsgName){
						if(cb){
							cb.runOnce = true;
							this.observe(retMsgName, cb, id);
						}
					}

					var cEvent = document.createEvent('Event');
					cEvent.initEvent(msgName, true, true);
					cEvent.callId = id;
					var mEl = document.getElementById(msgName+'_' + id + '_eventPasser');

					if(!mEl){
						mEl = this.createElement(msgName+'_' + id + '_eventPasser');
						cEl.appendChild(mEl);
					}

					var mpEl = document.createElement('div');
					mEl.appendChild(mpEl);

					var copy = {};
					try{
						var fields =Object.getOwnPropertyNames(data);
						for(var i=0; i<fields.length; i++){
							var field = fields[i];
							try{
								copy[field] = data[field];
							}
							catch(err){
								copy[field] = null;
							}
						}
					}
					catch(outerErr){
					}


					try{
						mpEl.innerText = JSON.stringify(copy);
					}
					catch(err){
						//couldn't stringify data
					}
					cEl.dispatchEvent(cEvent);
				}
			},

			storeData: function(id, data){
				var theId = 'messenger_' + id + '_dataStore';
				var d = document.getElementById(theId);
				if(!d){
					d = document.createElement('div');
					d.setAttribute('style', 'display:none;');
					d.setAttribute('id', theId);
					this.el.appendChild(d);
				}

				d.innerText = JSON.stringify(data);
			},

			getData: function(id){
				var theId = 'messenger_' + id + '_dataStore';
				var d = document.getElementById(theId);
				if(d){
					try{
						return JSON.parse(d.innerText);
					}catch(err){
					}
				}
			},

			createElement: function(id){
				var e = document.createElement('div');
				e.setAttribute('id', id);
				return e;
			},

			listToArray: function(nodeList){
				var arr = [];
				for(var i=0; node = nodeList[i]; i++){
					arr.push(node);
				}
				return arr;
			}
		};

		window.Messenger = Messenger;
		Messenger.init();
	}

	initMessenger(window);

};