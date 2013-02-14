(function(){
if(top.document === document) { // Only run this script in the top-most frame (there are multiple frames in Gmail)
	function init(){
		var server = Messenger.getData("server");

		// initialize credentials
	    // Utility functions to automatically add credentials
	    function Ajax(method, url, data, cb){
	    	if(!data){
	    		data = {};
	    	}

	    	var fn = Ajaxer.get;
	    	if(method === 'POST'){
	    		fn = Ajaxer.post;
	    	}

	    	fn(url, data, cb);
	    }

	    //used to communicate to the server
	    Messenger.observe('serverCall', function(data, id){
	    	Ajax(data.msgMethod, data.msgUrl, data.data, function(res){
				Messenger.sendMessage('serverCallReturn', res, null, null, id); //success
			});
	    }, 'all');

	    var port = chrome.extension.connect();
		port.onMessage.addListener(function(msg) {
			switch(msg.op){
				case "channelSetupReturn":
					Messenger.sendMessage(msg.op, msg.data, null, null, msg.id);
					break;
				case "channelConnectMessage":
					Messenger.sendMessage(msg.op, msg.data);
					break;
			}
		});

	    Messenger.observe('channelSetup', function(message, id){
	    	port.postMessage({op: 'channelSetup', data: message, id: id});
	    });

	    Messenger.observe('channelConnect', function(message, id){
	    	port.postMessage({op: 'channelConnect', data: message});
	    });
	}
	init();
};
})();