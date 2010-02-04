(function(){
	var WORKER_NAME = "WebWorker";
	var COMMENT_APPENDIX = "/*---comment added by JsWorker---*/";
	
	function WrappedWorker(nativeWorker, onmessage, onerror) {
		this._nativeWorker = nativeWorker;
		this._nativeWorker.onmessage = function(message) {
			onmessage && onmessage.apply(this._nativeWorker, [message]);
		},
		
		this._nativeWorker.onerror = onerror;
	}
	
	WrappedWorker.prototype = {
		postMessage : function(message) {
			/*if (isObject(message)) {
				message = toJson(message);
				message += COMMENT_APPENDIX;
			}*/
			return this._nativeWorker.postMessage(message);
		},
		
		terminate : function() {
			return this._nativeWorker.terminate();
		},
		
		getName : function() {
			return WORKER_NAME;
		}
	};
	
	function TextToUrlWorker(jsText, onmessage, onerror) {
		
	}
	
	TextToUrlWorker.prototype = {
		postMessage : function() {},
		terminate : function() {},
		getName : function() {
			return WORKER_NAME;
		}
	};
	
    JsWorker.WebWorker = {
        createWorkerFromUrl: function(jsUrl, onmessage, onerror){
            var nativeWorker = new window.Worker(jsUrl);
            return new WrappedWorker(nativeWorker, onmessage, onerror);
        },
        
        createWorkerFromText: function(jsText, onmessage, onerror){
            return new TextToUrlWorker(jsText, onmessage, onerror);
        }
    }; 
})();
