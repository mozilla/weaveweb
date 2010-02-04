(function(){

  function Worker(workerPool) {
  	this.workerPool = workerPool;
  }
  
  Worker.prototype = {
  	postMessage : function(message) {
  	  this.workerPool.sendMessage(message, this.childWorkerId);
    },
  
    terminate : function() {
		
	},
  
    setChildWorkerId : function(childWorkerId) {
  	  this.childWorkerId = childWorkerId;
    },
	
	getName : function() {
		return "GearsWorker";
	}
  };
  
  function getPostMessageFunctionText(workerId) {
    return [
      ";function postMessage(message) {",
	  "  google.gears.workerPool.sendMessage(message, 0);",
	  "};"
    ].join("\n");
  }
  
  function getOnMessageFunctionText() {
    return [
	  ";google.gears.workerPool.onmessage = function(messageText, senderId, messageObject) {",
	  "  onmessage && onmessage({'data' : messageObject.body});",
	  "};"
	].join("\n");
  }
  
  function getOnErrorFunctionText() {
  	return [
	  ";google.gears.workerPool.onerror = function(error) {",
	  "  error.name = '__WorkerError__';",
	  "  postMessage(error);",
	  "};"
	].join("\n");
  }
  
  JsWorker.GearsWorker = {
    createWorkerFromUrl : function(jsUrl, onmessage, onerror) {
	  var jsText = fetchScriptText(jsUrl);
	  return this.createWorkerFromText(jsText, onmessage, onerror);
    },
	
	createWorkerFromText : function(jsText, onmessage, onerror) {
	  if (!jsText) {
	  	throw new Error("No JavaScript text provided!");
	  }
	  
	  var workerPool = google.gears.factory.create("beta.workerpool");
	  var worker = new Worker(workerPool);
	  workerPool.onmessage = function(messageText, senderId, messageObject) {
		  if (messageObject.body.name == "__WorkerError__") {
		    isFunction(onerror) && onerror.apply(worker, [messageObject.body]);
		  }
		  else {
		  	isFunction(onmessage) && onmessage.apply(worker, [{
		  		"data": messageObject.body
		  	}]);
		  }
	    }
	 
	  var text = getPostMessageFunctionText() + jsText + getOnMessageFunctionText() + getOnErrorFunctionText();
	  var childWorkerId = workerPool.createWorker(text);
	  worker.setChildWorkerId(childWorkerId);
	  return worker;
	}
  };
})();
