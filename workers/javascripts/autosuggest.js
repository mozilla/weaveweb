/**
 * An autosuggest textbox control.
 * @class
 * @scope public
 */
function AutoSuggestControl(oTextbox /*:HTMLInputElement*/,
                            oProvider /*:SuggestionProvider*/) {
  this.delayHiding = false;
  /**
   * The currently selected suggestions.
   * @scope private
   */
  this.cur /*:int*/ = -1;

  /**
   * The dropdown list layer.
   * @scope private
   */
  this.layer = null;

  /**
   * Suggestion provider for the autosuggest feature.
   * @scope private.
   */
  this.provider = oProvider;

  /**
   * The textbox to capture.
   * @scope private
   */
  this.textbox = oTextbox;

  //initialize the control
  this.init();
}

/**
 * Autosuggests one or more suggestions for what the user has typed.
 * If no suggestions are passed in, then no autosuggest occurs.
 * @scope private
 * @param aSuggestions An array of suggestion objects { url, title }.
 * @param bTypeAhead If the control should provide a type ahead suggestion.
 */
AutoSuggestControl.prototype.autosuggest = function (aSuggestions, bTypeAhead) {

  //make sure there's at least one suggestion
  if (aSuggestions.length > 0) {
    if (bTypeAhead) {
      this.typeAhead(aSuggestions[0]);
    }

    this.showSuggestions(aSuggestions);
  } else {
     this.hideSuggestions();
  }
};

/**
 * Creates the dropdown layer to display multiple suggestions.
 * @scope private
 */
AutoSuggestControl.prototype.createDropDown = function () {
  var that = this;

  //create the layer and assign styles
  this.layer = document.getElementById("suggestions");

  //when the user clicks on the a suggestion, get the text (innerHTML)
  //and place it into a textbox
  
  this.layer.onclick =
  this.layer.onmousedown =
  this.layer.onmouseover = function (aEvent) {
    aEvent = aEvent || window.event;
    oTarget = aEvent.target || aEvent.srcElement;

    //get the suggestion container.
    while (oTarget && oTarget.className != "suggestion") {
      oTarget = oTarget.parentNode;
    }

    if (oTarget) {
      if (aEvent.type == "click") {
        that.textbox.value = that.getURLFromSuggestion(oTarget);
        //Opening URL on click events avoids popup blockers
        window.open(that.textbox.value);
        that.hideSuggestions();
        that.delayHiding = false;
      } else if (aEvent.type == "mousedown") {
        //XXX: searchbox's onblur event is fired after any mousedown,
        //so click doesn't fire.
        that.delayHiding = true;
      } else if (aEvent.type == "mouseover") {
        that.highlightSuggestion(oTarget);
      } else {
        that.textbox.focus();
      }
    }
  };


  //document.body.appendChild(this.layer);
};

AutoSuggestControl.prototype.getURLFromSuggestion = function (aSuggestionNode) {
  var urlElement = aSuggestionNode.childNodes[1].firstChild;//bottom node
  var urlValue = "";
  // Get the complete url, since it is divided into spans
  while (urlElement) {
    urlValue += urlElement.firstChild.nodeValue;
    urlElement = urlElement.nextSibling;
  }
  
  return urlValue;
}

/**
 * Gets the left coordinate of the textbox.
 * @scope private
 * @return The left coordinate of the textbox in pixels.
 */
AutoSuggestControl.prototype.getLeft = function () {
  var theNode = this.textbox;
  var iLeft = 0;

  while (theNode.tagName != "BODY") {
    iLeft += theNode.offsetLeft;
    theNode = theNode.offsetParent;
  }

  return iLeft;
};

/**
 * Gets the top coordinate of the textbox.
 * @scope private
 * @return The top coordinate of the textbox in pixels.
 */
AutoSuggestControl.prototype.getTop = function () {
  var oNode = this.textbox;
  var iTop = 0;

  while(oNode.tagName != "BODY") {
    iTop += oNode.offsetTop;
    oNode = oNode.offsetParent;
  }

  return iTop;
};

/**
 * Handles three keydown events.
 * @scope private
 * @param aEvent The event object for the keydown event.
 */
AutoSuggestControl.prototype.handleKeyDown = function (aEvent) {
  switch(aEvent.keyCode) {
    case 38: //up arrow
      this.previousSuggestion();
      break;
    case 40: //down arrow
      this.nextSuggestion();
      break;
    case 27:
    case 13: //enter
      this.hideSuggestions();
      break;
  }
};

/**
 * Handles keyup events.
 * @scope private
 * @param aEvent The event object for the keyup event.
 */
AutoSuggestControl.prototype.handleKeyUp = function (aEvent) {
  var iKeyCode = aEvent.keyCode;

  //for backspace (8) and delete (46), shows suggestions without typeahead
  if (iKeyCode == 8 || iKeyCode == 46) {
    this.provider.requestSuggestions(this, false);

  //make sure not to interfere with non-character keys
  } else if (iKeyCode < 32 || (iKeyCode >= 33 && iKeyCode < 46) ||
            (iKeyCode >= 112 && iKeyCode <= 123)) {
    //ignore
  } else {
    //request suggestions from the suggestion provider with typeahead
    //this.provider.requestSuggestions(this, true);
    //request suggestions from the suggestion provider without typeahead
    this.provider.requestSuggestions(this, false);
    this.cur = -1;
  }
};

/**
 * Hides the suggestion dropdown.
 * @scope private
 */
AutoSuggestControl.prototype.hideSuggestions = function () {
  $(this.layer).hide();
  this.cur = -1;
};

/**
 * Highlights the given node in the suggestions dropdown.
 * @scope private
 * @param aSuggestionNode The node representing a suggestion in the dropdown.
 */
AutoSuggestControl.prototype.highlightSuggestion = function (aSuggestionNode) {
  for (var i=0; i < this.layer.childNodes.length; i++) {
    var theNode = this.layer.childNodes[i];
    
    if (theNode == aSuggestionNode) {
      theNode.setAttribute("selected", "true");
      this.cur = i;
    } else if (theNode.hasAttribute("selected")) {
      theNode.removeAttribute("selected");
    }
  }  
};

/**
 * Initializes the textbox with event handlers for
 * auto suggest functionality.
 * @scope private
 */
AutoSuggestControl.prototype.init = function () {
  //save a reference to this object
  var that = this;

  //assign the onkeyup event handler
  this.textbox.onkeyup = function (aEvent) {
    //check for the proper location of the event object
    if (!aEvent) {
      aEvent = window.event;
    }

    //call the handleKeyUp() method with the event object
    that.handleKeyUp(aEvent);
  };

  //assign onkeydown event handler
  this.textbox.onkeydown = function (aEvent) {
    //check for the proper location of the event object
    if (!aEvent) {
      aEvent = window.event;
    }

    //call the handleKeyDown() method with the event object
    that.handleKeyDown(aEvent);
  };

  //assign onblur event handler (hides suggestions)
  this.textbox.onblur = function () {
    if (!that.delayHiding)
      that.hideSuggestions();
  };

  //create the suggestions dropdown
  this.createDropDown();
};

/**
 * Highlights the next suggestion in the dropdown and
 * places the suggestion into the textbox.
 * @scope private
 */
AutoSuggestControl.prototype.nextSuggestion = function () {
  var cSuggestionNodes = this.layer.childNodes;

  if (cSuggestionNodes.length > 0 && this.cur < cSuggestionNodes.length-1) {
    var oNode = cSuggestionNodes[++this.cur];
    this.highlightSuggestion(oNode);
    this.textbox.value = this.getURLFromSuggestion(oNode);
  }
  
  if (oNode != null) {
    var elemTop = $(oNode).offset().top - $(this.layer).offset().top;
    var elemBottom = elemTop + $(oNode).height();
    
    if ((this.cur-4 > 0) && ((elemTop <= 0) || (elemBottom <= 0) ||
        (elemTop >= 190) || (elemBottom >= 190)) )
      $(this.layer).scrollTo(cSuggestionNodes[this.cur-4]);
  }
};

/**
 * Highlights the previous suggestion in the dropdown and
 * places the suggestion into the textbox.
 * @scope private
 */
AutoSuggestControl.prototype.previousSuggestion = function () {
  var cSuggestionNodes = this.layer.childNodes;

  if (cSuggestionNodes.length > 0 && this.cur > 0) {
    var oNode = cSuggestionNodes[--this.cur];
    this.highlightSuggestion(oNode);
    this.textbox.value = this.getURLFromSuggestion(oNode);
  }
  if (oNode != null) {
    var elemTop = $(oNode).offset().top - $(this.layer).offset().top;
    var elemBottom = elemTop + $(oNode).height();
    if ((elemTop <= 0) || (elemBottom <= 0) ||
        (elemTop >= 190) || (elemBottom >= 190))
      $(this.layer).scrollTo(oNode);
  }
};

/**
 * Selects a range of text in the textbox.
 * @scope public
 * @param iStart The start index (base 0) of the selection.
 * @param iLength The number of characters to select.
 */
AutoSuggestControl.prototype.selectRange = function (iStart, iLength) {
  //use text ranges for Internet Explorer
  if (this.textbox.createTextRange) {
    var oRange = this.textbox.createTextRange();
    oRange.moveStart("character", iStart);
    oRange.moveEnd("character", iLength - this.textbox.value.length);
    oRange.select();

  //use setSelectionRange() for Mozilla
  } else if (this.textbox.setSelectionRange) {
    this.textbox.setSelectionRange(iStart, iLength);
  }

  //set focus back to the textbox
  this.textbox.focus();
};

AutoSuggestControl.prototype.addSuggestion = function(aSuggestion) {
  var containerNode;
  var topNode;
  var bottomNode;
  var titleNode;
  var tagsNode;
  var bookmarkInfoNode;
  var bookmarkImage;
  var searchText = jQuery.trim(this.textbox.value);
    
  var bookmarkId = '';
      
  containerNode = document.createElement("div");
  
  // top for title,tags and bookmark star
  topNode = document.createElement("div");
  titleNode = document.createElement("div");
  bookmarkInfoNode = document.createElement("div");
  tagsNode = document.createElement("div");
  
  // bottom for url
  bottomNode = document.createElement("div");
  
  //Set Styles
  containerNode.className = "suggestion";
  topNode.className = "top";
  titleNode.className = "suggestion-title";
  bookmarkInfoNode.className = "suggestion-bookmark-info";
  tagsNode.className = "suggestion-tags";
  bottomNode.className = "bottom";
  
  this.highlightSearchMatches(titleNode, this.getRegexString(searchText), aSuggestion.title);
  topNode.appendChild(titleNode);
  
  if (aSuggestion.isBookmark) {
    containerNode.setAttribute("isBookmark", "true");
    if (aSuggestion.tags != null && aSuggestion.tags.length > 0) {
      bookmarkInfoNode.setAttribute("hasTags", "true");
      this.highlightSearchMatches(tagsNode, this.getRegexString(searchText), aSuggestion.tags);
      bookmarkInfoNode.appendChild(tagsNode);
    }    
    topNode.appendChild(bookmarkInfoNode);
  }
    
  this.highlightSearchMatches(bottomNode, this.getRegexString(searchText), aSuggestion.url);
    
  // Append everything to the main container.
  containerNode.appendChild(topNode);
  containerNode.appendChild(bottomNode);
  
  // Append the container to the layer
  this.layer.appendChild(containerNode);
  this.updateSuggestionElements();
};

/**
 * Generates a string containing the search terms passed as aSearchString, so it
 * can be used with a regex object.
 * @param aSearchString search string from which to generate the regex string.
 * @returns The generated regex string.
 */
AutoSuggestControl.prototype.getRegexString = function(aSearchString) {
  var searchTerms = aSearchString.split(' ');
  var regexString = "";
  $.each(searchTerms, function() {
    regexString += Weave.Util.regexEscape(this) + "|";
  });
  if (regexString != "")
    return regexString.substring(0,regexString.length-1);
  return null;
};

/**
 * From the passed aTargetText, it looks for the search term and divide the string in <span>s,
 * with a different style for matches.
 * @scope public
 * @param aContainer The container where we append the results.
 * @param aRegexString Regex string with the search terms to highlight.
 * @param aTargetText The string we use to search for matches and highlight them.
 */
AutoSuggestControl.prototype.highlightSearchMatches = function(aContainer, aRegexString, aTargetText) {
  
  var tempSpan;
  if (aTargetText != null && aTargetText.length > 0) {
    var regex = new RegExp(aRegexString, 'i');
    var match = regex.exec(aTargetText);
    if (match && match != "")
    {
      match = match[0];
      var index = aTargetText.indexOf(match);
      if(index != -1)
      {
        if (index != 0) {
          tempSpan = document.createElement("span");
          tempSpan.innerHTML = aTargetText.substring(0, index);
          aContainer.appendChild(tempSpan);
        }
        tempSpan = document.createElement("span");
        tempSpan.innerHTML = match;
        tempSpan.setAttribute("class","match");
        aContainer.appendChild(tempSpan);
        aTargetText = aTargetText.substring(index+match.length);
        this.highlightSearchMatches(aContainer, aRegexString, aTargetText);
      }
    } else {
        tempSpan = document.createElement("span");
        tempSpan.innerHTML = aTargetText;
        aContainer.appendChild(tempSpan);
    }
  }
}

/**
 * Builds the suggestion layer contents, moves it into position,
 * and displays the layer.
 * @scope private
 * @param aSuggestions An array of suggestions for the control.
 */
AutoSuggestControl.prototype.showSuggestions = function (aSuggestions) {
  this.layer.innerHTML = "";  //clear contents of the layer
  
  for (var i=0; i < aSuggestions.length; i++) {
    this.addSuggestion(aSuggestions[i]);
  }
  $(this.layer).show();
  this.updateSuggestionElements();
};

/**
 * Modified the suggestion nodes so that their contents fit with the actual size.
 * XXX: This is  bit hackish but couldn't find a way of achieving this with pure CSS.
 */
AutoSuggestControl.prototype.updateSuggestionElements = function () {
  var currentNode = null;
  var titleNode = null;
  var bookmarkInfoNode = null;
  var bookmarkMinWidth = 16;
  if ($(this.layer).is (':visible')) {
    for (i=0; i < this.layer.childNodes.length; i++) {
      currentNode = this.layer.childNodes[i];
      var url = this.getURLFromSuggestion(currentNode);
      titleNode = currentNode.childNodes[0].childNodes[0];
      bookmarkInfoNode = currentNode.childNodes[0].childNodes[1];
      if (bookmarkInfoNode) {
        var suggestionTagsNode = bookmarkInfoNode.childNodes[0];
        var titleRight = titleNode.offsetLeft+titleNode.offsetWidth;
        var titleBookmarkDiff = titleRight - bookmarkInfoNode.offsetLeft;
        // if title and bookmark nodes overlap..
        if ( titleBookmarkDiff > 0) {
          // if bookmark has tags and reached its smallest size, hide tags and update title
          if (suggestionTagsNode && (bookmarkInfoNode.offsetWidth - titleBookmarkDiff) <= 36) {
            $(suggestionTagsNode).hide();
            bookmarkInfoNode.style.paddingRight = 0;
            bookmarkInfoNode.style.width = 16;
            titleNode.style.width = titleNode.offsetWidth + 20;
          }
          // if bookmark node is in its smallest size, resize title.
          if ( (bookmarkInfoNode.offsetWidth - titleBookmarkDiff) <= 16) {
            titleNode.style.width = titleNode.offsetWidth - titleBookmarkDiff - 10;
          } else {// resize bookmark
            bookmarkInfoNode.style.width = bookmarkInfoNode.offsetWidth - titleBookmarkDiff - 10;
            if (suggestionTagsNode && suggestionTagsNode.offsetWidth >= bookmarkInfoNode.offsetWidth)
              suggestionTagsNode.style.width = bookmarkInfoNode.offsetWidth-20;
          }
        } else { //if nodes don't overlap, just resize bookmark and its tags to fill empty space
          var newBookmarkWidth = currentNode.offsetWidth - titleRight;
          var margins = 10 + 4 + 4;//title right margin + node left/right padding
          newBookmarkWidth -= margins;
          if (suggestionTagsNode) {
            newBookmarkWidth -= 18;//bookmarkinfo padding right
          }
          bookmarkInfoNode.style.width = newBookmarkWidth;
          if (suggestionTagsNode && suggestionTagsNode.offsetWidth >= bookmarkInfoNode.offsetWidth)
            suggestionTagsNode.style.width = newBookmarkWidth-25;//suggestion tags padding left
        }
      }
      
    }
  }  
}

/**
 * Inserts a suggestion into the textbox, highlighting the
 * suggested part of the text.
 * @scope private
 * @param oSuggestion The suggestion object for the textbox { url, title}.
 */
AutoSuggestControl.prototype.typeAhead = function (oSuggestion) {
  //check for support of typeahead functionality
  if (this.textbox.createTextRange || this.textbox.setSelectionRange){
    var iLen = this.textbox.value.length;
    var url = oSuggestion.url;
    
    this.textbox.value = url;
    this.selectRange(iLen, url.length);
  }
};
