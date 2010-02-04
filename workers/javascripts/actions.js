/**
 * Weave (WV) namespace.
 */
if ("undefined" == typeof(Weave)) {
  var Weave = {};
};

var WV_MAX_OBJECTS_PER_REQUEST = 10;

var WV_VERSION = "1.0";
var WV_USER_SERVER = "https://auth.services.mozilla.com/user/" + WV_VERSION;
var WV_PROXY_PAGE = "http://localhost/wnew/proxy.php";


Weave.Actions = {
  /* The array with urls and titles that can be suggested to the user. */
  _suggestions : null,
  
  /* The controller of the suggestions. */
  _autoSuggestControl : null,

  /* The private key used for decryption of bookmarks and history. */
  _privateKey : null,

  /* Array with name of the collections we are going to work with. */
  _collectionsNames : new Array(),

  /* Flag indicating if the private key is already available. */
  _privateKeyReceived : false,

  /* Array containing the elements needed for the decryption (keyrign and
     bulkIV) of the collections's elements (i.e. for decrypting the
     bookmarks and history). */
  _userEncryptions : new Array(),

  _cipherTexts : new Array(),

  /* Timeout used in case we are ready for starting the data decryption
     but we don't yet have the keys. */
  _checkForDataDecryptionStartTimeout : null,

  _collectionItemsCallOffset : new Array(),

  /* Data decrypt worker: we use one instance for all the calls. */
  _singleDataDecryptWorker : null,

  _requestCounter : null,
  _decryptorIntervalId : null,
  _dataDecryptWorkers : new Array(),
  _keyDecryptWorker : null,

  /* Credentials used to access the Weave API. */
  _username : null,
  _password : null,
  _passphrase : null,
	_cluster: null,

  /* Flag used to indicate if we are signing in the user. */
  _isSigningIn : false,

  /* Flag indicating if the first decrypted url data was received. */
  _firstDatalreadyReceived : false,

  /* Array of flag indicating if we are decrypting data
    already (one flag per collection type). */
  _isDecryptingData : new Array(),


  _init : function() {
    this._suggestions = new Suggestions();

    this._autoSuggestControl =
      new AutoSuggestControl(
        document.getElementById("search-textbox"), this._suggestions);
          
    $("#search-textbox").blur(function(){Weave.Actions.setDefaultTextForBox(this);});
    $("#search-textbox").keypress(function(aEvent){window.setTimeout(Weave.Actions.handleSearchAction, 0, aEvent)});
    $("#search-textbox").focus(function(){Weave.Actions.clearDefaultTextFromBox(this);});
    
    window.onbeforeunload = function(aEvent) {
      if (Weave.Actions._username) {//If we are signed in, confirm exit.
        return "You will be signed out. Are you sure?";
      }
      //XXX: Do not return anything, to avoid browser confirmation on leaving.
    }
    
    var onerror = function(aEvent) {
      alert("Error: " + aEvent.message);
      Weave.Actions._stop();
      Weave.Actions._blockMainWindow(false);
    };
    var onmessage = function(aEvent) {
      if (aEvent.data.decryptedData) {
        Weave.Actions._decryptData(aEvent.data.privateKey, aEvent.data.collectionName, true);
        Weave.Actions._processDecryptedData(aEvent.data.decryptedData);
      } else if (aEvent.data.message) {

      }
    };

    this._singleDataDecryptWorker =
      JsWorker.createWorkerFromUrl("dataDecryptor.js", onmessage, onerror);
  },
  
  /**
   * Cleans the default text from a given input box.
   * @param aElement the element to be cleaned.
   */
  clearDefaultTextFromBox : function(aElement) {
    if (aElement.defaultValue == aElement.value) {
      aElement.value = "";
      aElement.setAttribute("defaultText", "false");
    }
  },
  
  /**
   * Sets the default text for a given input box.
   * @param aElement the element to be set.
   */
  setDefaultTextForBox : function(aElement) {
    if (aElement.value == "") {
      aElement.value = aElement.defaultValue;
      aElement.setAttribute("defaultText", "true");
    }
  },
  
  /**
   * Executes an action in the search box according to the action
   * executed by the user.
   * @param aEvent the event to hanlde.
   */
  handleSearchAction : function(aEvent) {
    var searchTextbox = document.getElementById("search-textbox");
    var url;
        
    switch (aEvent.keyCode) {
      case 27:
        searchTextbox.value = '';
        break;
      case 13:        
        if (Weave.Actions.isURL(searchTextbox.value))
          url = searchTextbox.value;
        else
          url = Weave.Actions._suggestions.getUrlFromKeyword(searchTextbox.value);                  
        if (url != null)
          window.open(url);
        break;
    }
  },
  
  /**
   * Check if the passed string is a valid URL
   * @param aText text to check
   */ 
  isURL : function(aText) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(aText);
  },

  /**
   * Blocks/Unblocks the window-s display, according to the flag received.
   * @param aBlockFlag Wether or not the window needs to be blocked.
   */
  _blockMainWindow : function(aBlockFlag) {
    if (aBlockFlag) {
      $.blockUI(
        {
          overlayCSS: { backgroundColor: '#ececec' },
          message: $("#processing-div")
        }
      );

    } else {
      $.unblockUI();
    }
  },

  /**
   * Shows/Hides the "loading" message and throbber, according to the provided
   * parameter.
   * @param aShowMessage flag indicating if the message should be displayed.
   */
  _showLoadingMessage : function(aShowMessage) {
    if (aShowMessage) {      
      $("#still-loading-message").fadeIn('slow');
    } else {
      $("#still-loading-message").fadeOut('slow');
    }
  },

  /**
   * Signs the user in. Note that the API does not have a proper sign in method,
   * so, we emulate it by calling the getColletions method and validating the
   * returned data. If the returned data contains errors, then the log in failed,
   * otherwise, we keep the data returned and mark the user as "signed in".
   */
  signIn : function() {
    // sets some data needed all along the user's "session".
    this._username = $("#username").val();
    this._password = $("#password").val();
    this._passphrase = $("#passphrase").val();

    // stops any process, just in case there is any.
    this._stop();

    this._blockMainWindow(true);

    // sets the sign in flag and "signs in" the user.
    this._isSigningIn = true;
    this._getCluster();
  },

  /**
   * Finishes the sign in procedure, by either moving to the main view page, or
   * either show an error message.
   * @param aSignInSucceeded flag indicating if the sign in succeeded or not.
   */
  _finishSignIn : function(aSignInSucceeded) {
    
    // clears out the flag.
    this._isSigningIn = false;
    
    // if signed in, keep the page blocked.
    if (aSignInSucceeded) {
      // however, we change the background page: from sign in to "main view".
      $("#login-div").attr("hidden", "true");
      $("#main-view-div").attr("hidden", "");

      // displays the user name in the "main view".
      $("#username-placeholder").text(this._username);
      
      var textbox = $("#search-textbox");
      textbox.attr("value", "Search Bookmarks and History");
      textbox.attr("defaultText", "true");

    } else {      
      // if sign in failed, unblock the page and show error message.
      this._blockMainWindow(false);
      $("#errorMessage").attr("visible", "true");
    }
  },

  /**
   * Stops all the processes, if any.
   */
  _stop : function() {
    // terminate all the workers.
    if (this._keyDecryptWorker) {
      this._keyDecryptWorker.terminate();
      this._keyDecryptWorker = null;
    }

    $.each(this._dataDecryptWorkers, function() {
      this.terminate();
    });

    this._dataDecryptWorkers = new Array();

    if (this._decryptorIntervalId != null) {
      window.clearInterval(this._decryptorIntervalId);
      this._decryptorIntervalId = null;
    }

    this._suggestions.cleanSuggestions();
    this._privateKey = null;
    this._privateKeyReceived = false;
    this._cipherTexts = new Array();
    this._userEncryptions = new Array();
    this._isDecryptingData = new Array();
    this._firstDatalreadyReceived = false;
    this._requestCounter = 0;

    this._collectionItemsCallOffset = new Array();

    window.clearTimeout(this._checkForDataDecryptionStartTimeout);
  },

  /**
   * Send a  request to the server with the specified parameters.
   * @param aUrl the url of the server to be called.
   * @param aParameters the array of parameters to be sent in the request.
   * @param aLoadedHandler the method to be executed once the data is returned.
   * @param aErrorHandler the method to be executed in case of errors.
   */
  _serverRequest : function(aURL, aParameters, aLoadedHandler, aErrorHandler) {
    // increase the total request counter.
    this._requestCounter++;

    // read the array of parameters and convert them into a string.
    // TODO: create a method for this string-fication
    var stringOfDdata = "";

    for (var key in aParameters) {
      stringOfDdata += key;
      stringOfDdata += '=';
      stringOfDdata += aParameters[key];
      stringOfDdata += '&';
    }
    stringOfDdata = stringOfDdata.substr(0, stringOfDdata.length - 1);

    $.ajax(
      {
        url: aURL, method: "GET", data: stringOfDdata,
        success: aLoadedHandler, error: aErrorHandler
      });
  },

  /**
   * Handle error.
   * @param aXHR
   * @param aTextStatus
   * @param aErrorThrown
   */
  _errorHandler : function(aXHR, aTextStatus, aErrorThrown) {
    this._requestCounter--;
    
    // if we were executing a sign in, we notify about it.
    if (this._isSigningIn) {
      this._finishSignIn(false);
    }

    Weave.Actions._blockMainWindow(false);
  },

  /**
   * Get the cluster of the user.
   */
  _getCluster : function() {
    var parameters = new Array();
    parameters['username'] = this._username;
    parameters['password'] = this._password;
    parameters['url'] = WV_USER_SERVER + "/" + this._username + "/node/weave/";

    this._serverRequest(
      WV_PROXY_PAGE, parameters,
      function(aData) {
        Weave.Actions._getClusterHandleLoad(aData);
      }, this._errorHandler);
  },

  /**
   * Handles the response of the server in response to cluster request
   */
  _getClusterHandleLoad : function(aData) {
    this._requestCounter--;

		// set cluster and prepare url
		this._cluster = aData;
		var aUrl = aData + "/" + WV_VERSION + "/" + this._username + "/storage/";
		
    // we fetch keys, bookmarks and history
    var names = ["keys", "bookmarks", "history"];
    $.each(names, function(aIndex, aName) {
      if (aName == "keys") {
        // get the keys, needed for decryption.
        Weave.Actions._getInitialDataFromCollection(aUrl + aName, aName);

      } else if (aName == "bookmarks" || aName == "history") {
        // add the name of the collection to the array of collections
        // being fetch. Then get the initial collections.
        Weave.Actions._collectionsNames.push(aName);
        Weave.Actions._getInitialDataFromCollection(aUrl + aName, aName);
      }
    });
  },

  /**
   * Get the collections of the user.
   * @param aURL
   * @param aType
   */
  _getInitialDataFromCollection : function(aURL, aType) {
    var parameters = new Array();

    parameters['username'] = this._username;
    parameters['password'] = this._password;
    parameters['url'] = aURL;

    // we need to get all the keys, but only the first bookmark/history,
    // just to get the decryption data (bulkIV and keyring).
    if (aType == "bookmarks" || aType == "history") {
      parameters['sort'] = 'newest';
      parameters['limit'] = '1';
      parameters['offset'] = '0';
    }

    this._serverRequest(
      WV_PROXY_PAGE, parameters,
      function(aData) {
        Weave.Actions.
          _getInitialDataFromCollectionHandleLoad(aData, aURL, aType);
      }, this._errorHandler);
  },

  /**
   * Handle the returned collection.
   * @param aData
   * @param aURL
   * @param aType
   */
  _getInitialDataFromCollectionHandleLoad : function(aData, aURL, aType) {
    this._requestCounter--;
		
		// if we were executing a sign in, we notify about it.
    if (this._isSigningIn) {
      //If returned string contains "Authentication failed" then sign in failed.
      this._finishSignIn(aData.indexOf("Authentication failed") == -1);
    }

    // converts the returned string into an array, before working on it.
    var identifiers = eval(aData);

    $.each(identifiers, function(aIndex, aId) {
      Weave.Actions._getWeaveBasicObject(aURL + "/" + aId, aType);
    });
  },

  /**
   * Get weave basic object.
   */
  _getWeaveBasicObject : function(aURL, aType) {
    var parameters = new Array();

    parameters['username'] = this._username;
    parameters['password'] = this._password;
    parameters['url'] = aURL;

    this._serverRequest(
      WV_PROXY_PAGE, parameters,
      function(aData) {
        Weave.Actions._getWeaveBasicObjectHandleLoad(aData, aType);
      }, this._errorHandler);
  },

  /**
   * Handles the returned weave basic object.
   */
  _getWeaveBasicObjectHandleLoad : function(aData, aType) {
    this._requestCounter--;

    var payload = $.evalJSON($.evalJSON(aData).payload);
    if ($.isArray(payload)) {
      payload = payload[0];
    }

    if (aType == "keys") {
      if ($.evalJSON(aData).id == "privkey") {
        this._startKeyDecryptor(payload);
      }

    } else if ((aType == "bookmarks") || (aType == "history")) {
      // we get the encryption data for the history/bookmark.
      this._getCollectionEncryption(payload.encryption, aType);

      // and we add the text to be decrypted to the array of data.
      this._cipherTexts[aType] = new Array();
      this._cipherTexts[aType].push(new String(payload.ciphertext));
    }
  },

  /**
   * Start the private key decrytor.
   */
  _startKeyDecryptor : function(aPrivateKey) {
    var onerror = function(aEvent) {
      if (aEvent.message.indexOf("Incorrect passphrase") != -1) {
        alert("Incorrect passphrase! Please try again.");
        Weave.Actions._username = null;
        window.location = "index.html";
      } else {
        alert("Error: " + aEvent.message);
        Weave.Actions._stop();
        Weave.Actions._blockMainWindow(false);
      }
    };

    var onmessage = function(aEvent) {
      if (aEvent.data.privateKey) {
        // store the private key, that will be needed later for decryption.
        Weave.Actions._privateKey = aEvent.data.privateKey;

        // sets the flag indicating we already got the private key.
        Weave.Actions._privateKeyReceived = true;
      } else if (aEvent.data.message) {
      }
    };

    this._keyDecryptWorker =
      JsWorker.createWorkerFromUrl("keyDecryptor.js", onmessage, onerror);

    this._keyDecryptWorker.postMessage(
      {
        privateKey: aPrivateKey,
        passphrase: this._passphrase
      }
    );
  },

  /**
   * Get the encryption of the given collection, needed for decrypting the
   * data (we need the builkIV and the keyring).
   * @param aEncryptionURL the API url needed to call in order to get the
   * required encruption data.
   * @aCollectionName the name of the collection (e.g. "bookmarks", "history").
   */
  _getCollectionEncryption : function(aEncryptionURL, aCollectionName) {
    this._userEncryptions[aCollectionName] =  { keyring: null, bulkIV: null };

    var parameters = new Array();
    parameters['username'] = this._username;
    parameters['password'] = this._password;
    parameters['url'] = aEncryptionURL;

    this._serverRequest(
      WV_PROXY_PAGE, parameters,
      function(aData) {
        Weave.Actions._getCollectionEncryptionHandleLoad(
          aData, aCollectionName);
      }, this._errorHandler);
  },

  /**
   * Handle returned ecryption.
   */
  _getCollectionEncryptionHandleLoad : function(aData, aCollectionName) {
    this._requestCounter--;

    // 1. we save the decryption data in the array of user encryptions.
    var payload = $.evalJSON($.evalJSON(aData).payload);
    if ($.isArray(payload)) {
      payload = payload[0];
    }

    $.each(payload.keyring, function() {
      // we need to get only the part of the keyring that contains the
      // code, not an url.
      Weave.Actions._userEncryptions[aCollectionName].keyring = this;
      return false;
    });
    this._userEncryptions[aCollectionName].bulkIV = payload.bulkIV;


    // 2. if we already have the keys, we start the decryption of this type
    // of collection elements (i.e. bookmarks or history elements). Otherwise
    // we wait for a few seconds and try again.
    this._checkForDataDecryptionStart(aCollectionName);
  },

  _checkForDataDecryptionStart : function(aCollectionName) {
    if (Weave.Actions._privateKeyReceived) {
      Weave.Actions._decryptData(Weave.Actions._privateKey, aCollectionName, true);
      // we get the remaining collection weavie objects N by N (pagination),
      // starting at number 1 (skip the first one since we already got it).
      Weave.Actions._collectionItemsCallOffset[aCollectionName] = 1;
      Weave.Actions._getNextBatchOfItems(aCollectionName);

    } else {
      // we keep calling until we have the keys
      Weave.Actions._checkForDataDecryptionStartTimeout =
        window.setTimeout(
          Weave.Actions._checkForDataDecryptionStart,
          500, aCollectionName);
    }
  },

  /**
   *
   * @param aCollectionName the name of the collection from where the items
   * will be extracted (e.g. bookmarks, history).
   */
  _getNextBatchOfItems : function(aCollectionName) {
    var url = this._cluster + WV_VERSION + "/" +
			this._username + "/storage/" + aCollectionName;

    var parameters = new Array();
    parameters['username'] = this._username;
    parameters['password'] = this._password;
    parameters['url'] = url;
    parameters['sort'] = 'newest';
    parameters['limit'] = WV_MAX_OBJECTS_PER_REQUEST;
    parameters['offset'] = this._collectionItemsCallOffset[aCollectionName];

    this._serverRequest(
      WV_PROXY_PAGE, parameters,
      function(aData) {
        Weave.Actions._getNextBatchOfItemsHandleLoad(url, aData, aCollectionName);
      }, this._errorHandler);

    this._collectionItemsCallOffset[aCollectionName] += WV_MAX_OBJECTS_PER_REQUEST;
  },

  /**
   * Handles the response of the server, with the data corresponding to the items
   * of a given collection.
   * @param aURL the url called during the call that just returned.
   * @param aData the data returned by the server.
   * @param aCollectionName the name of the collection we are
   * working on (e.g. history).
   */
  _getNextBatchOfItemsHandleLoad : function(aURL, aData, aCollectionName) {
    this._requestCounter--;

    // converts the returned string into an array, before working on it.
    var identifiers = eval(aData);

    $.each(identifiers, function(aIndex, aId) {
      Weave.Actions._getNextWeaveObject(aURL + "/" + aId, aCollectionName);
    });
    
    // Once we start decrypting the items, we call the next batch of items
    Weave.Actions._getNextBatchOfItems(aCollectionName);
  },

  /**
   * Request the details of a weave object to the server.
   * TODO: factorize this method with the one that is made upon sign in.
   */
  _getNextWeaveObject : function(aURL, aCollectionName) {
    var parameters = new Array();

    parameters['username'] = this._username;
    parameters['password'] = this._password;
    parameters['url'] = aURL;

    this._serverRequest(
      WV_PROXY_PAGE, parameters,
      function(aData) {
        Weave.Actions._getNextWeaveObjectHandleLoad(aData, aCollectionName);
      }, this._errorHandler);
  },

  /**
   * Handles the returned weave basic object.
   */
  _getNextWeaveObjectHandleLoad : function(aData, aCollectionName) {
    this._requestCounter--;

    var payload = $.evalJSON($.evalJSON(aData).payload);
    if ($.isArray(payload)) {
      payload = payload[0];
    }

    // we add the text to be decrypted to the array of data.
    if (payload != null)
      this._cipherTexts[aCollectionName].push(new String(payload.ciphertext));

    // we call the decryption.
    this._decryptData(this._privateKey, aCollectionName, false);
  },

  /**
   * Start the data decrytor.
   * @param aPrivateKey.
   * @ aCollectionName
   * @param aPermissionToRun flag indicating if the caller has permission to
   * run even if the decrypting flag is on. This prevents having several
   * threads running this code, and therefore slowing the UI.
   */
  _decryptData : function(aPrivateKey, aCollectionName, aPermissionToRun) {
    var decryptNext = aPermissionToRun;

    if (0 == this._cipherTexts[aCollectionName].length) {
      this._isDecryptingData[aCollectionName] = false;
      decryptNext = false;

    } else {
      // if we are not decrypting and we have elements to decrypt, allow
      // any caller to do the decryption.
      if (!this._isDecryptingData[aCollectionName]) {
        decryptNext = true;
      }
    }

    if (decryptNext) {
      // set the flag that indicates we are now decrypting.
      this._isDecryptingData[aCollectionName] = true;

      // get the first element (bookmark/history) to be decrypted. We need to
      // explicitly cast it as string, otherwise it is not recognized as so.
      var textToDecrypt =
        new String(this._cipherTexts[aCollectionName].splice(0, 1));

      // starts to decrypt the bookmark/history in a new thread.
      this._startDataDecryptWorker(aPrivateKey, textToDecrypt, aCollectionName);
    }
  },

  /**
   * Start the data decrypt worker.
   */
  _startDataDecryptWorker : function(
    aPrivateKey, aCipherText, aCollectionName) {
    this._dataDecryptWorkers.push(this._singleDataDecryptWorker);

    this._singleDataDecryptWorker.postMessage({
      privateKey: aPrivateKey,
      bulkIV: this._userEncryptions[aCollectionName].bulkIV,
      keyRing: this._userEncryptions[aCollectionName].keyring,
      cipherText: aCipherText,
      collectionName: aCollectionName
    });
  },

  /**
   * Process decrypted data.
   */
  _processDecryptedData : function(aDecryptedData) {
    var data = $.trim(aDecryptedData);
    var stillLoading = false;
    var that = this;
    var dataObj;
    var url;

    $.each(this._collectionsNames, function(){
      if (that._isDecryptingData[this]) {
        stillLoading = true;
        return false;
      } else {
        return true;
      }
    });

    if (!stillLoading) {
      this._showLoadingMessage(false);
    }

    if (!this._firstDatalreadyReceived) {
      this._firstDatalreadyReceived = true;
      this._blockMainWindow(false);
      this._showLoadingMessage(true);
    }

    // remove all the junk chars.
    while (data.length > 0 && data.charAt(data.length - 1) != "]") {
      data = data.substr(0, (data.length - 1));
    }
    
    try {
      dataObj = $.evalJSON(data)[0];
      
      if (dataObj.type) {
        url = dataObj.bmkUri ? dataObj.bmkUri : dataObj.uri;
        // type could be bookmark, separator, livemark, and folder.
        if (dataObj.type == "bookmark" && /^(?!place)/.test(url)) {
          dataObj.tags = (dataObj.tags != null ? dataObj.tags.toString() : "");
          this._suggestions.addSuggestion(
            url, dataObj.title, dataObj.keyword, dataObj.tags, true, this._autoSuggestControl);
        }
      } else {
        url = dataObj.histUri ? dataObj.histUri : dataObj.uri;
        this._suggestions.addSuggestion(
          url, dataObj.title, null, "", false, this._autoSuggestControl);
      }
    }catch(exc) {}//XXX: Some JSON is failing the evaluation. Needs to be checked.
  }
}
