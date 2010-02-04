var JsWorker = window.JsWorker = {};

(function(){
    function hasGears(){
        return window.google && google.gears && google.gears.factory;
    }
    
    function hasWebWorker(){
        return typeof window.Worker != "undefined";
    }
    
    var concreteWorker = hasWebWorker() ? JsWorker.WebWorker : (hasGears() ? JsWorker.GearsWorker : JsWorker.TimeoutWorker);
    
    JsWorker.createWorkerFromUrl = function() {
        concreteWorker = hasWebWorker() ? JsWorker.WebWorker : (hasGears() ? JsWorker.GearsWorker : JsWorker.TimeoutWorker);
        
        return concreteWorker.createWorkerFromUrl.apply(this, arguments);
    };
    
    JsWorker.createWorkerFromText = function(){
        concreteWorker = hasWebWorker() ? JsWorker.WebWorker : (hasGears() ? JsWorker.GearsWorker : JsWorker.TimeoutWorker);
        
        return concreteWorker.createWorkerFromText.apply(this, arguments);
    }
    
})();



///------------

function EMPTY_FUNCTION(){

}

/**
 * Get an XMLHttpRequest object
 * @return {Object} XMLHttpRequest object
 */
function getXhrObject(){
    var xhr = null;
    if (window.XMLHttpRequest)
        try {
            xhr = new XMLHttpRequest();
        }
        catch (error) {
        }
    else {
        if (window.ActiveXObject) {
			var names = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
            for (var i = 0; i < names.length; i++) {
				try {
					xhr = new ActiveXObject(names[i]);
					break;
				}
				catch (error) {
				}
			}
        }
    }
    return xhr;
}

/**
 * Fetch the text content of script url
 * @param {String} jsUrl
 * @return {String} script text
 */
function fetchScriptText(jsUrl) {
	var xhr = getXhrObject(), text;
	if (xhr) {
		xhr.open("GET", jsUrl, false);
		xhr.send(null);
		return xhr.responseText;
	}
}

function isFunction(anything){
    return anything && (typeof anything == "function" || anything instanceof Function);
}

function isString(anything){
    return anything && (typeof anything == "string" || anything instanceof String);
}

function isObject(anything) {
	return anything !== null && typeof anything == "object";
}

function toArray(obj, offset, startWith){
    var arr = startWith || [];
    for (var i = offset || 0; i < obj.length; i++) {
        arr.push(obj[i]);
    }
    return arr;
}

function isArray(anything) {
		Object.prototype.toString.apply(anything) == "[object Array]";
	}

	function escapeString(str) {
		return ('"' + str.replace(/(["\\])/g, '\\$1') + '"').
		  replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").
		  replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
	}

	function endsWith(string, pattern) {
		var pos = string.length - pattern.length;
    	return pos >= 0 && string.lastIndexOf(pattern) === pos;
	}

function hitch(scope, method){
    var preArgs = [];
    if (arguments.length > 2) {
        preArgs = toArray(arguments, 2);
    }
    if (!method) {
        method = scope;
        scope = window;
    }
    var methodName = isString(method);
    var func = methodName ? (scope || window)[methodName] : method;
    return function(){
        var args = toArray(arguments);
        return func && func.apply(scope || this, preArgs.concat(args));
    }
}

function toJson(json) {
		if (json === undefined) {
			return "undefined";
		}
		var type = typeof json;
		if (type == "number" || type == "boolean") {
			return json + "";
		}
		if (json === null) {
			return "null";
		}
		if (isString(json)) {
			return escapeString(json);
		}
		var recurse = arguments.callee;
		if (isArray(json)) {
			var result = [];
			for (var i = 0, n = json.length; i < n; i++) {
				var val = recurse(json[i]);
		 	    if(typeof val != "string"){
				  val = "undefined";
			    }
			    result.push("\n" + val);
			}
			return "\n" + "[" + result.join(",") + "]";
		}
		if (type == "function") {
			return null;
    }
		var output = [], key;
		for (key in json) {
			var keyStr, val;
		    if(typeof key == "number"){
			  keyStr = '"' + key + '"';
		    }else if(typeof key == "string"){
			  keyStr = escapeString(key);
		    }else{
			  continue;
		    }
		    val = recurse(json[key]);
			if(typeof val != "string"){
			  continue;
		    }
			output.push("\n" + keyStr + ":" + val);
		}
		return "{" + output.join(",") + "\n" + "}";
	}
