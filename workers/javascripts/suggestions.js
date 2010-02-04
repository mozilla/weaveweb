/**
 * Provides suggestions user.
 * @class
 * @scope public
 */
function Suggestions() {
  this._suggestions = new Array();
}

Suggestions.prototype.addSuggestion = function(
  aURL, aTitle, aKeyword, aTags, aIsBookmark, aSuggestController) {
        
  var alreadyAdded = false;
  var isBookmark = false;
  
  // first of all, fill in the title if not provided
  if (null == aTitle || "" == aTitle) {
    aTitle = aURL;
  }  
  for (var i = 0; i < this._suggestions.length; i++) {
    if (aURL == this._suggestions[i].url) {
      alreadyAdded = true;
      // also, if the old one was not a bookmark, but the new one is,
      // then we update the flag.
      if (!this._suggestions[i].isBookmark &&
           aIsBookmark) {
        this._suggestions[i].isBookmark = true;        
      }
      
      //if it's a bookmark, update tags and keyword
      if (aIsBookmark) {        
        this._suggestions[i].keyword = aKeyword;        
        this._suggestions[i].tags = aTags;
      }
      
      break;
    }
  }  
  
  
  if (!alreadyAdded) {
        
    this._suggestions.push(
      { url: aURL, 
        title: aTitle, 
        keyword: aKeyword,
        tags: aTags,
        isBookmark: aIsBookmark
      });
    
    if (aSuggestController) {
      var text = aSuggestController.textbox.value;
      
      if (text.length > 0) {
        text = text.toLowerCase();
        var suggestion = 
          getSuggestion(
            text, aURL, aTitle, aKeyword, aTags, aIsBookmark);
      
        if (suggestion) {
          aSuggestController.addSuggestion(suggestion);
        }
      }      
    }
  }
}

Suggestions.prototype.cleanSuggestions = function() {
  this._suggestions = new Array();
}

/**
 * Request suggestions for the given autosuggest control.
 * @scope protected
 * @param oAutoSuggestControl The autosuggest control to provide suggestions
 * for.
 */
Suggestions.prototype.requestSuggestions = function (
  aAutoSuggestControl, aTypeAhead) {
  var suggestion = null;
  var suggestions = [];
  var textboxValue = aAutoSuggestControl.textbox.value;
  var words = jQuery.trim(textboxValue).split(' ');
        
  if (textboxValue.length > 0) {
    //search for matching urls: checks if the string does match somewhere.
    $.each(this._suggestions, function() {
      // check the suggestion matches all words in any position.
      for(var i = 0; i < words.length; i++) {
        suggestion =
          getSuggestion(words[i], this.url, this.title, this.keyword, this.tags, this.isBookmark);
        if (!suggestion)
          break;
      }
      
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });
  }

  //provide suggestions to the control
  aAutoSuggestControl.autosuggest(suggestions, aTypeAhead);
};

/**
 * Request suggestions for the given autosuggest control.
 * @scope protected
 * @param oAutoSuggestControl The autosuggest control to provide suggestions
 * for.
 */
Suggestions.prototype.getUrlFromKeyword = function (aKeyword) {  
  var url = null;
  var params = aKeyword.split(' ');
      
  //search url matching the passed keyword
  for (var i = 0; i < this._suggestions.length; i++) {        
    if (params[0] == this._suggestions[i].keyword) {
      url = this._suggestions[i].url;
      break;
    }
  }
    
  if (url != null) {
    for(i = 1; i < params.length; i++) {
      var insertIndex = url.indexOf("%s");
      if (insertIndex != -1) {
        url = url.substring(0, insertIndex) + params[i] + url.substring(insertIndex+2);        
      } else {
        break;
      }
    }
  }
  
  return url;
};

function getSuggestion(aText, aURL, aTitle, aKeyword, aTags, aIsBookmark) {
  var suggestion = null;  
    
  var regex = new RegExp(Weave.Util.regexEscape(aText), 'i');
  
  if (aTitle.search(regex) != -1 || aURL.search(regex) != -1 || aTags.search(regex) != -1) {    
    suggestion = {
      title: aTitle,
      url: aURL,
      keyword: aKeyword,
      tags: aTags,
      isBookmark: aIsBookmark
    };
  }
  
  return suggestion;  
};
