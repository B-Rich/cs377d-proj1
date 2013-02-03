// Only run this script in the top-most frame (there are multiple frames in Gmail)
if(top.document == document) {
	(function(window){
		var Ajaxer = {
				get: function(url, data, cb){
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function(){
						if(xhr.readyState !== 3) {
							cb(xhr);
						}
					};
					
					xhr.open("GET", url, true);
			    	xhr.send();
				},
				
				post: function(url, data, cb){
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function(){
						if(xhr.readyState !== 3){
							cb(xhr);
						}						
					};

					xhr.open("POST", url, true);
					xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
					xhr.send(data);
				}	
			};
		
		window.Ajaxer = Ajaxer;
	})(window);
};