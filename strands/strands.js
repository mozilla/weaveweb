/**
Strands - JavaScript Cooperative Threading and Coroutine support
Copyright (C) 2007 Xucia Incorporation
Author - Kris Zyp - kriszyp@xucia.com
 /* ***** BEGIN LICENSE BLOCK *****
  * Version: MPL 1.1/GPL 2.0/LGPL 2.1
  *
  * The contents of this file are subject to the Mozilla Public License Version
  * 1.1 (the "License"); you may not use this file except in compliance with
  * the License. You may obtain a copy of the License at
  * http://www.mozilla.org/MPL/
  *
  * Software distributed under the License is distributed on an "AS IS" basis,
  * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  * for the specific language governing rights and limitations under the
  * License.
  * ***** END LICENSE BLOCK ***** */
function temp() {
		var standardPush = Array.prototype.push;
	try {
	var debugMode =document.location.search.indexOf("debug=true") > -1;
	}
	catch(e) { debugMode=true}
	var push = function(obj,value) {
		return standardPush.call(obj,value); // preserve default push behavoir
	}
	var suspendedFrame = null;
	var currentThread = {};
	var Suspend = {	// returned value when a coroutine is suspended, and state of the top frame when suspended
		toString: function() { return "SUSPENDED" }
	}
	/**
	 * This is wrap the given function in a try catch when debug mode is off. If an error is thrown, the error message will be displayed with an alert
	 */		
	var tryCatch = function(func) {
		return strands.errorWrapper(func)();
	}
	var specificNotify = {};
	Future = function(func,args,thisObj,callback) {
		this.topFrames = [];
		var self = this;
		this.fulfill = function(retValue) {
			if (retValue == specificNotify) {
				var targetFrames = retValue.targetFrames;
				retValue = retValue.retValue;
			}
			else
				self.value = retValue;
			var frame;
			while (frame = (targetFrames || self.topFrames).shift()) { // iterate through all the resulting threads/frames
				// This is the beginning of a resume
				currentThread = {};
		//		checkRestState();
//				if (!frame._r) 
	//				throw new Error("Future called without being in a result state");
				frame.retValue = retValue;
				if (frame.NRY)
					frame.thread = currentThread;
				while (frame.parentFrame) {
					frame = frame.parentFrame; // now the bottom frame
					frame.thread = currentThread;
				}
				if (frame.args) {
					suspendedFrame = frame; // the .parents indicates it was a NotReadyYet function, so there is no suspended frames above it
					tryCatch(function() {
						frame.args.callee.call(frame.frameThis); // now resume	
					});
				}
				else {
					//A thread was resumed with no call stack
					suspendedFrame = null;
				}
			}
		}
		if (func) {
			if (callback)
				this.addListener(callback);
			(function() {
				var f = _frm(arguments);
				
				var value = func.apply(thisObj || window,args||[]);
				if (value===_S) return f.sus();
				self.fulfill(value);
			})();			
		}
	}
	Future.prototype = {
		addListener : function(func) {
			push(this.topFrames,func);
		},
		interrupt : function () {
			this.fulfill(strands.INTERRUPTED);
		},
		isDone : function() {
			return this.hasOwnProperty('value');
		},
		result : function(timeout) {
			if (this.hasOwnProperty('value') || (suspendedFrame && suspendedFrame.retValue)) { // The future has been called, we can resume
				var value = (suspendedFrame ? suspendedFrame.retValue : 0) || this.value;
				suspendedFrame = null; // make sure we don't get any callers picking this up, we may not need this
				if (value == strands.TIMEOUT || value== strands.INTERRUPTED)
					throw value;
				return value;// the future has already been fulfilled so we can just return the result
			}
			var topFrame = {}
			push(this.topFrames,topFrame);
			var self = this;
			topFrame.args = [];
			topFrame.args.callee=function() {return self.result()};
			suspendedFrame = topFrame;
			if (timeout) {
				setTimeout(function() {
					self.fulfill(specificNotify = {retValue:strands.TIMEOUT,targetFrames:[topFrame]});
				},timeout);
			}
			return Suspend;
		}
	}

	var CallFrame = function() {
	}
	var Construct = function() {};
	var defaultScope = CallFrame.prototype = {
		sus : function() { // this handles exceptions as well as suspensions
				for (var i = 0; i < arguments.length-2;i++) // record all the vars and params 
					this[i] = arguments[i];
				this.cp = arguments[arguments.length-2]; // record the code pointer
				this.frameThis = arguments[arguments.length-1]; // record the code pointer
				if (suspendedFrame == this)
					same;
				if (!suspendedFrame)
					NoSuspendedFrame; // This can be caused by returning Suspend without actually being in a suspension, or if _S ends up in a variable
				suspendedFrame.parentFrame = this;
				
				this.childFrame = suspendedFrame; // it needs to be reexecuted
				suspendedFrame = this;
				if (this.thread == currentThread) // Assertion
					SuspensionFrameShouldNotBeCurrentThread;
				return Suspend;
			},
		exc : function(exception) {
			if (this.ecp == null)
				throw exception;
			this.thr = true;
			this.ex  = exception;
			return this.ecp;
		},
		clsr : function(func) {
			if (this.scp)
				this.inner = func;
			return this.inner;
		},
		scp : 2,
		keys : function(obj) {
			var keys = [];
			for(var n in obj) 
				push(keys,n);
			return keys;
		},
		_new : function(value,args) { // create a new instance of an object or constructor
			if (value === Suspend)
				return value;
			var frame = _frm(arguments);				
			if (!frame._cp) {
				frame._cp=1;
				frame.Const= value;
				Construct.prototype = value.prototype;
				if (value === String || value === Number) // these classes must not have a target this
					return args.length?new value(args[0]):new value;
				if (value !== Date) { // date does not have to directly instantiated, but it does need an undefined scope, it also needs to be able to handle variable arguements
					frame.newThis = new Construct();
				}
			}
			if ((value = frame.Const.apply(frame.newThis,args?args:[])) == Suspend) return frame.sus();
			if (value instanceof Object) return value; // if the new returns a different value than "this"			
			return frame.newThis;
		}
	}
	/**
	 * Suspend execution for the given amount time
	 * @param time	milliseconds to pause
	 */
	sleep = function(time) {
		var frame = _frm(arguments);
		if (!frame._cp) { // if it is zero
			frame._cp = 1;
			setTimeout((frame.future = new Future).fulfill,time);
			frame.future.result();
			return frame.sus();
		}
		frame.future.result(); // this is the result operation to resume
	}

	strands = { 
		defaultScope : defaultScope,
		loadScope : function(){},
		/**
		 * This function that will be called to return a function that should execute the provided function in order to initialize the stack 
		 * Any time a new stack is created, the returned function will be used. This provides a mechanism to wrap all processing
		 * within a try catch.
		 */
		errorWrapper : function(func) {
			var newFunc = function() {
				if (debugMode)
					return func.apply(this,arguments);			
				try {
					return func.apply(this,arguments);			
				}
				catch (e) {
					alert(e.message || e);
				}
			}
			newFunc.noTryCatch = func;
			return newFunc;
		},
		TIMEOUT : {toString:function(){return "Thread timeout"}},
		INTERRUPTED : {toString:function(){return "Thread interrupted"}},
		sleep : sleep,
		/**
		 * This is a constant that is returned from functions to indicate that the code execution is suspending
		 */
		Suspension : _S = Suspend,

	/**
 * Makes an XHR (Ajax) request using the given url, method, and post data (for POST requests) and 
	returns contents that came from the server.

 * @param {Object} url
 * @param {Object} method
 * @param {Object} postData
 */
	request : function(url, method, postData) {
		var frame = _frm(arguments);
		if (!frame._cp) {
			var getXMLHttpRequest = function () {
				if (parent.XMLHttpRequest)
			        return new parent.XMLHttpRequest();
				else if (window.ActiveXObject)
			        return new ActiveXObject("Microsoft.XMLHTTP");
			}
		 	var xhr = getXMLHttpRequest();
			frame.future = new Future();
			var ajaxDataReader = function () {
				if (xhr.readyState == 4) {
			        // only if "OK"
			        var loaded;
			        try {
			        	var status = xhr.status;
			        	loaded = xhr.responseText.length > 0;//firefox can throw an exception right here
			        } catch(e) {}
			        if (loaded) 
	    				frame.future.fulfill(xhr.responseText);				
					else
						frame.future.interrupt();
	        		xhr = null; // This is to correct for IE memory leak
				}
			}
			frame._cp = 1;
		    xhr.open(method || "POST", url, true); 
			xhr.onreadystatechange = ajaxDataReader;
		    xhr.send(postData);
		}
			
		var result = frame.future.result();
		if (result == _S) frame.sus();
		return result;
	},
	compilerUrl : 'js/compiler.js',
	js17 : (function() { try {return Iterator}catch(e){}})(), // something better would be good?
		/**
		 * Loads the given script. It will compile the script if necessary for coroutine support. 
		 * You can set strands.precompiled = true if the scripts have
		 * been precompiled on the server. It was HIGHLY recommended
		 * that you compiled the scripts on the server to reduce the overhead
		 * on the client. 
		 * @param {Object} url
		 */
	
	loadScript : function(url) {	
		var frame = _frm(arguments);
		switch(frame._cp) {
			case undefined:frame.future = new Future();
				frame.url = url;
				frame._cp = 1;
			case 1: case 2:case 3:url = frame.url;
			function load() {
				if (strands.js17) {
					if (frame._cp != 2) {
					    var scriptTag = document.createElement("script"); // must use the document that supports events, not his one
					    scriptTag.onload = frame.future.fulfill;
					    scriptTag.type= 'application/javascript;version=1.7';
						scriptTag.setAttribute("src", url);
					    document.body.appendChild(scriptTag); // This is supposed to be asynchronous, but sometimes it will get its request before continuing
				    }
					frame._cp = 2;
				    return frame.future.result();
			    }			    
				else {
					var source = strands.request(url,'GET');
					if (source == Suspend) return Suspend; //we can only do this because it is an inner function
					eval(source);
				}
			}
			var compOptions,shorten;
			if (url.match(/\.jss$/)) {
				compOptions = {};
				shorten = 1;
			}
			else if (url.match(/\.js17$/)) {
				if (strands.js17) 
					shorten = 0;
				else {
					compOptions = {source:'js17'};
					shorten = 2;
				}				
			} 
			if (strands.precompiled) 
				url = url.substring(0,url.length-shorten);
			else
			{
				if (compOptions) {
					if (!strands.compiler || frame._cp == 2) {
						frame._cp = 2; 
						var compiler;
						if ((compiler = strands.request(strands.compilerUrl,'GET'))==Suspend)
							return frame.sus();
						eval(compiler);
						frame._cp = 3;
						strands.compiler = new StrandsCompiler(compOptions);
					}
					var source;
					if ((source = strands.request(url,'GET'))==Suspend)
						return frame.sus();
					source = strands.compiler.compile(source);
					eval(source);
					return;
				}
			}
			if (load() == Suspend) return frame.sus();
		}
	}
}
var coreturn;
strand = strands.js17 ? eval("(function(func) {\r\n"+
"return function() {"+	
"			if (suspendedFrame && suspendedFrame.thread == currentThread && suspendedFrame.args) {"+
"				var frame = suspendedFrame;"+
"				suspendedFrame = frame.childFrame;"+ // if this is undefined it means we are at the top of the resume stack
"				delete frame.thread;"+
"				delete frame.childFrame;"+// for assertions
"				var result = suspendedFrame.args.callee.apply(this,suspendedFrame.args);"+ // resume the stack
"				if (result == Suspend) return CallFrame.prototype.sus.call(frame,this);"+ // if we have to suspend again right away
"		}"+
"		else {"+ //fresh entry
"			var frame = func.apply(this,arguments);"+
"			if (!(frame != null && typeof(frame) == 'object' &&"+
"					typeof(frame.next) == 'function' && typeof(frame.send) == 'function'))"+
"				return frame;"+
"			frame.args = arguments;"+
"			var result;"+
"		}"+
"		try{"+
"			while(1){"+
"				coreturn = undefined;"+ // global return value
"				result = frame.send(result);"+
"				if (result == Suspend) return CallFrame.prototype.sus.call(frame,this);"+
"			} "+
"		} catch(e if e == StopIteration) {"+
"			return coreturn;"+
"		}"+
"	}"+
"})") : function() {throw new Error("can not call strand except as a function wrapper");};	/** 
	 * This creates a new Strands call frame. It becomes the scope for the function maintains variables and parameters across suspensions and resumes. It should only be used in compiled code
	 */	
	_frm = function(args) {
		if (args.caller) args.caller=0; // this fixes a big memory leak;
		if (suspendedFrame) {
			// if it is loading we start a new frame
			if (suspendedFrame.thread == currentThread && suspendedFrame.args && !suspendedFrame.NRY) {// this means we are resuming
				var frame = suspendedFrame;
				//TODO: Implement this:
				if (frame.args.callee != args.callee && frame.args.callee.toString() != args.callee.toString()) {// this means the function that is being called has changed, the function has been replaced, so we need to call the orginal one
	//				if (this!=frame.frameThis) {
						suspendedFrame = null;
						StackAlterationError("The function has changed, the means for handling this right now is not complete");
		//			}
/*					var retValue = frame.args.callee.call(frame.frameThis);
					if (retValue == _S){
						// this is the tricky part, we need to call the next function and have it be guaranteed to return a _S
					}
					else {// we need to come up with a way to ensure that we have the right rv#
						frame["rv" + frame.cp++] = retValue;  //make sure we increment the cp so we are the next part
					}
					return frame;*/
				}
				delete frame.thread;
	
				suspendedFrame = frame.childFrame; // if this is undefined it means we are at the top of the resume stack
				delete frame.childFrame; // for assertions
				if (suspendedFrame && suspendedFrame._r) {//Assertion stuff
					if (! suspendedFrame.parentFrame)
						SuspendedFrameHasNoParentFrame;
					else
						delete suspendedFrame.parentFrame;				
				}
				for (var i =0;i<frame.args.length;i++)
					args[i] = frame.args[i];
				frame.scp=0; // start in the suspend segment
				return frame;
			}
			else { // this case means that there is a suspendedFrame variable left over from a previous resume/suspension
				// It should only be a left over from a suspension, and it should be the bottom frame.  A resume should null out suspendedFrame
	
				suspendedFrame = null;  // a suspension took place somewhere else, so now we can get rid of this
			}
		}
		frame = new CallFrame;
		frame.scp = 1; // Why is this needed for opera to work? somewhere the prototype _cp is getting set, need to figure out why
		frame.args = args;
		return frame;
	}
	function Generator(frame){
		this.frame = frame;
	};
	Generator.prototype = {
		next : function() {
			return this.send();
		},
		send : function(value) {			
			suspendedFrame = this.frame;
			suspendedFrame.thread = currentThread;
			_receive = value;
			return this.frame.args.callee.call(this.frame.frameThis);			
		}
	} 
	_gen = function(frame) {
		return new Generator(frame);
	}
	returns = function(value) {
		coreturn = value;
		throw StopIteration;
	}
}
temp();
