var connections = {};
var doc = chrome.extension.getBackgroundPage().document;

chrome.extension.onConnect.addListener(function(aPort){
	var port = aPort;

	var connection = {
		port: port
	}

	connections[port.sender.tab.id] = connection;
	port.onMessage.addListener(function(request){
		switch(request.op){
			case "channelSetup":
				connection.iframe = doc.createElement('iframe');
				var scriptSource = request.data.src;

				//frame.src = "channel.html";
				connection.iframe.onload = function(){
					var fw = connection.iframe.contentWindow;
					var fd = connection.iframe.contentDocument;
					var gScript = fd.createElement('script');
					gScript.src = scriptSource;

					gScript.onload = function(){
						connection.goog = fw.goog;
						port.postMessage({op: 'channelSetupReturn', id: request.id});
					};

					fd.head.appendChild(gScript);
				}

				doc.body.appendChild(connection.iframe);
				break;

			case "channelConnect":
				var server = request.data.server;
				var token = request.data.token;
				var goog = connection.goog;

				if(goog.appengine.Socket && goog.appengine.Socket.BASE_URL && goog.appengine.Socket.BASE_URL.substring(0, server.length) !== server){
					goog.appengine.Socket.BASE_URL = server + goog.appengine.Socket.BASE_URL;
				}

				var channelMessage = function(obj){
					port.postMessage({op: "channelConnectMessage", data: obj});
				}

				var channel = new goog.appengine.Channel(request.data.token);
				var socket = channel.open({
					onopen: function(){
						channelMessage({op: "open"});
					},

					onmessage: function(msg){
						channelMessage({op: "message", data: msg});
					},

					onerror: function(msg){
						channelMessage({op: "error", data: msg});
					},

					onclose: function(msg){
						channelMessage({op: "close", data:msg});
					}
				});

				break;
		}
	});

	//cleanup on disconnect
	port.onDisconnect.addListener(function(){
		connection = null;
		delete connections[port.sender.tab.id];
	});
});