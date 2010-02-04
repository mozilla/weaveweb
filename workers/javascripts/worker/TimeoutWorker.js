(function(){
  var jsTextTemplateBefore = [
    "var __TIME_OUT_WORKER_RUNNER = function __worker_runner__() {",
    "  var __worker__ = this;",
    "  function postMessage(message) {",
    "    __worker__._receiveMessage(message);",
    "  }",
    "  __worker__._onmessageHandler = function() {",
    "    var message;",
    "    while (message = __worker__._messageQueue.shift()) {",
    "      try {",
    "        onmessage && onmessage({'data' : message});",
    "      }catch(e) {",
    "         __worker__._lastError = e;",
    "      }",
    "    }",
    "    __worker__._handleError();",
    "    /*if (!__worker__._aboutToTerminate) {",
    "      __worker__._timeoutId = window.setTimeout(arguments.callee, 1000);",
    "    }*/",
    "  };"
  ].join("");
	
  var jsTextTemplateAfter = "}";
	
  function Worker(jsText, onmessage, onerror) {
    this._messageQueue = [];
    this._onmessage = onmessage;
    this._onerror = onerror;
    this._lastError = null;
		
    var text = jsTextTemplateBefore + jsText + jsTextTemplateAfter;
    window.eval(text);
    __TIME_OUT_WORKER_RUNNER.apply(this);
		
    this._aboutToTerminate = false;
    //this._timeoutId = window.setTimeout(this._onmessageHandler, 0);
  }
	
  Worker.prototype = {
    postMessage : function(message) {
      message && this._messageQueue.push(message);
      this._timeoutId = window.setTimeout(this._onmessageHandler, 0);
    },
		
    terminate : function() {
      //process all messages before termination
      this._aboutToTerminate = true;
      //this._onmessageHandler();
      window.clearTimeout(this._timeoutId);
    },
		
    _receiveMessage : function(message) {
      this._onmessage.apply(this, [{"data" : message}]);
    },
		
    _handleError : function() {
      this._lastError && this._onerror && this._onerror.apply(this, [this._lastError]);
    },
		
    getName : function() {
      return "TimeoutWorker";
    }
  };
	
  JsWorker.TimeoutWorker = {
    createWorkerFromUrl: function(jsUrl, onmessage, onerror){
      // we first get all the text of the file defining the.
      // worker. We need to do so since the "importScript" is not 
      // supported by the TimeOutWorker, so it fails on IE8.
      var jsText = _getFileText(jsUrl);
      return new Worker(jsText, onmessage, onerror);
    },
        
    createWorkerFromText: function(jsText, onmessage, onerror){
      return new Worker(jsText, onmessage, onerror);
    }
  };
  
  function _trim(str, chars) {
    return _ltrim(_rtrim(str, chars), chars);
  }
  
  function _ltrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
  }
  
  function _rtrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
  }
  
  function _getFileText(aFile) {
    var initialText = fetchScriptText(aFile);
    var allText = "";
    
    // get the imports of the file.
    var imports = 
      initialText.substr(
        initialText.indexOf('importScripts(') + 14, 
        initialText.indexOf(')') - 14);
    imports = imports.split(",");
    
    $.each(imports, function(aIndex, aFileName) {
      aFileName = _trim(aFileName);
      aFileName = aFileName.substr(1, aFileName.length - 2)
      allText += fetchScriptText(aFileName);
    });
    allText +=  initialText.substr( initialText.indexOf(");") + 2 );
  
    return allText;
  }
	
})();
