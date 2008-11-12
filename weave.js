/* WeaveClient modules and YUI have to be imported before running this! */

function populateFolder(snap, guid, name, root) {
  /* Handle some special top-level folder names */
  if (name == "menu") {
    name = "Bookmarks Menu";
  }
  if (name == "toolbar") {
    name = "Bookmarks Toolbar";
  }
  if (name == "unfiled") {
    name = "Unfiled Bookmarks";
  }
  
  var node = new YAHOO.widget.TextNode({
    label: name,
    title: name + " folder",
    style: "bmkHead"
  }, root, true);
  
  for (bmk in snap) {
    var cur = snap[bmk];
    if (cur.parentGUID && cur.parentGUID == guid && cur.type) {
      switch (cur.type) {
        case "folder":
          populateFolder(snap, bmk, cur.title, node);
          break;
        case "bookmark":
          var tags = "Untagged";
          if (cur.tags.length != 0)
            tags = cur.tags.join(", ");
            
          var child = new YAHOO.widget.TextNode({
            label: cur.title,
            title: tags,
            style: "bmkLink",
            href: cur.URI
          }, node, true);
          break;
        default:
          /* Ignore livemarks and places for now */
          break;
      }
    }
  }
}

function renderBookmarks() {
  var folder = [];
  var topLvl = Weave.Xfer.bmk.snap;
  for (bmk in topLvl) {
    var cur = topLvl[bmk];
    if (cur.type && cur.type == "folder" && !cur.parentGUID) {
      folder[folder.length] = bmk;
    }
  }
  
  var tree = new YAHOO.widget.TreeView("bmks");
  /* Populate the top-level folders, and let recursion take care of the rest */
  for (i = 0; i < folder.length; i++) {
    populateFolder(topLvl, folder[i], folder[i], tree.getRoot());
  }
  tree.draw();
}

/*
function renderFlow() {
  var con = '<div id="bFlow">'
  for (bmk in Weave.Xfer.bmk.snap) {
    var cur = Weave.Xfer.bmk.snap[bmk];
    if (cur.type && cur.type == "bookmark") {
      con += '<a href="';
      con += cur.URI;
      con += '"><img src="http://images.websnapr.com/?url=';
      con += cur.URI;
      con += '" alt="';
      con += cur.title;
      con += '" /></a>';
    }
  }
  con += '</div>';
  return con;
}
*/

function renderTabs() {
  var i = 1;
  var list = '<table class="tbcen">';
  var tabs = Weave.Xfer.tab.snap;
  for (link in tabs) {
    var cur = tabs[link].state.entries[0];
    var dis = '';
    if (i % 4 == 1) {
      dis += '<tr>';
    }
    dis += '<td width="25%"><img src="http://images.websnapr.com/?url=';
    dis += cur.url;
    dis += '" /><br /><a class="tabLink" href="';
    dis += cur.url;
    dis += '">';
    if (cur.title)
      dis += cur.title;
    else
      dis += cur.url;
    dis += '</a></td>';
    if (i % 4 == 0) {
      dis += '</tr>';
    }
    i += 1;
    list += dis;
  }
  list += '</table>';
  return list;
}

function showTabs() {
  var tabView = new YAHOO.widget.TabView();
  var msg = document.getElementById('message');
  
  var bCon = '';
  if (!Weave.Xfer.bmk.snap) {
    bCon = '<p>No bookmarks found!</p>';
  } else {
    bCon = '<div id = "bmks"></div>';
  }
  tabView.addTab(new YAHOO.widget.Tab({
    label: 'Bookmarks',
    active: true,
    content: bCon
  }));

  /*
  if (Weave.Xfer.bmk.snap) {
    var fCon = renderFlow();
    var fTab = new YAHOO.widget.Tab({
      label: 'Cover Flow',
      content: fCon,
      active: true
    });
    tabView.addTab(fTab);
    tabView.addListener('activeIndexChange', flowRefresh);
  }
  */
  
  var tCon = '';
  if (!Weave.Xfer.tab.snap) {
    tCon = '<p>No open tabs or windows found!</p>';
  } else {
    tCon = renderTabs();
  }
  tabView.addTab(new YAHOO.widget.Tab({
    label: 'Tabs/Windows',
    content: tCon,
  }));
  
  tabView.appendTo('container');
  msg.style.visibility = "visible";
  lod.hide();
  
  renderBookmarks();
}

function cryptoStep1() {
  /* Step 1: Generate Key from Passphrase */
  var phrase = Weave.Xfer.Smuggler.phrase;
  var salt = Weave.Util.Base64.decode(Weave.Xfer.Smuggler.salt);
  
  Weave.Xfer.Smuggler.result = Weave.Crypto.PKCS5.generate(phrase, salt, 4096, 32);
  window.setTimeout(cryptoStep2, 1);
}

function cryptoStep2() {
  /* Step 2: Unwrap RSA key with generated AES key */
  var msg = 'Step 2 / 5: Unwrapping RSA key...';
  document.getElementById('current').innerHTML = msg;
  
  var key = Weave.Xfer.Smuggler.result;
  var rsaKey = Weave.Util.Base64.decode(Weave.Xfer.key.privkey);
  var rsaIV = Weave.Util.Base64.decode(Weave.Xfer.key.privkeyIV);
  var ursaKey = Weave.Crypto.AES.decrypt(key, rsaIV, rsaKey);
  
  Weave.Xfer.Smuggler = {result: ursaKey};
  window.setTimeout(cryptoStep3, 1);
}

function cryptoStep3() {
  /* Step 3: Extract RSA values from key using ASN.1 parser
     Here is where we find out if the passphrase was incorrect. */
  var msg = 'Step 3 / 5: Parsing ASN.1 encoded RSA key...';
  document.getElementById('current').innerHTML = msg;
  
  var key = Weave.Xfer.Smuggler.result;
  var tag = Weave.Crypto.ASN1.PKCS1.parse(key);
  if (!tag) {
    alert('Your passphrase was incorrect, try logging in again!');
    window.location = '../index.php';
  }
  
  Weave.Xfer.Smuggler = {result: tag};
  window.setTimeout(cryptoStep4, 1);
}

function cryptoStep4() {
  /* Step 4: Use RSA key values to unwrap AES symmetric key */
  var msg = 'Step 4 / 5: Unwrapping symmetric keys with parsed RSA values...';
  document.getElementById('current').innerHTML = msg;
  
  var tag     = Weave.Xfer.Smuggler.result;
  var user    = Weave.Xfer.user;
  
  var rsa = new RSAKey();
  rsa.setPrivateEx(tag[0], tag[1], tag[2], tag[3], tag[4], tag[5], tag[6], tag[7]);
  
  var bsymKey = false;
  var tsymKey = false;
  
  if (Weave.Xfer.bmk.keys) {
    var bmkKey  = Weave.Xfer.bmk.keys.ring[user];
    bsymKey = Weave.Util.intify(rsa.decrypt(Weave.Util.StH(Weave.Util.Base64.decode(bmkKey))));
  }
  if (Weave.Xfer.tab.keys) {
    var tabKey  = Weave.Xfer.tab.keys.ring[user];
    tsymKey = Weave.Util.intify(rsa.decrypt(Weave.Util.StH(Weave.Util.Base64.decode(tabKey))));
  }
  
  Weave.Xfer.Smuggler = {result: [bsymKey, tsymKey]};
  window.setTimeout(cryptoStep5, 1);
}

function cryptoStep5() {
  /* Step 5: Decode snapshots into JSON - finally! */
  var msg = 'Step 5 / 5: Decrypting data into JSON...';
  document.getElementById('current').innerHTML = msg;
  
  if (Weave.Xfer.Smuggler.result[0]) {
    var bSnap = Weave.Util.Base64.decode(Weave.Xfer.bmk.snap);
    var bsymKey = Weave.Xfer.Smuggler.result[0];
    var bmkIV   = Weave.Xfer.bmk.keys.bulkIV;
    var bJSON = Weave.Crypto.AES.decrypt(bsymKey, Weave.Util.Base64.decode(bmkIV), bSnap);
  }
  
  if (Weave.Xfer.Smuggler.result[1]) {
    var tSnap = Weave.Util.Base64.decode(Weave.Xfer.tab.snap);
    var tsymKey = Weave.Xfer.Smuggler.result[1];
    var tabIV   = Weave.Xfer.tab.keys.bulkIV;
    var tJSON = Weave.Crypto.AES.decrypt(tsymKey, Weave.Util.Base64.decode(tabIV), tSnap);
  }

  try {
    var bmkjs = YAHOO.lang.JSON.parse(Weave.Util.clearify(bJSON));
    var tabjs = YAHOO.lang.JSON.parse(Weave.Util.clearify(tJSON));
  } catch (e) {
    //alert("Invalid JSON!");
  }
  Weave.Xfer.bmk.snap = bmkjs;
  Weave.Xfer.tab.snap = tabjs;
  
  /* All done! */
  msg = "We're all done with decryption!";
  document.getElementById('current').innerHTML = msg;
  
  showTabs();
}

function unwrapAndDecrypt() {
  var pp = document.getElementById('passphrase').value;
  
  /* let's load up the spinner to keep user occupied */
  var msg = '<p><img src="images/loading.gif" /></p>';
  msg += '<p id="current">Step 1 / 5: Generating AES Key from Passphrase...</p>';
  lod.setBody(msg);
  
  var sal = Weave.Xfer.key.privkeySalt;
  Weave.Xfer.Smuggler = {phrase: pp, salt: sal, result: false};
  window.setTimeout(cryptoStep1, 1);
}

function decrypt() {
  var type = Weave.Xfer.bmk.stat.snapEncryption;
  
  var supported = false;
  switch (type) {
    case "none":
    case "aes-256-cbc":
      supported = 1;
      break;
    default:
      break;
  }
  
  if (supported) {
    if (type != "none") {
      /* Get passphrase */
      var msg = '<p>Enter your passphrase to begin decryption:</p><p>';
      msg += '<input type="password" id="passphrase" /></p>';
      msg += '<p><input id="phrasesub" type="button" value="Go!" /></p>';
      lod.setBody(msg);
      
      var psub = new YAHOO.widget.Button("phrasesub");
      psub.on("click", unwrapAndDecrypt);
    } else {
      showTabs();
    }
  } else {
    var msg = '<p>Oops, the encryption type of your data is not supported!</p><p><a href="index.php">Try again</a> with a different server?</p>';
    lod.setBody(msg);
  }
}

function showPopup(header, body, c, w) {
  if (!c)
    var c = false;
  if (!w)
    var w = "240px";
    
  var pop = new YAHOO.widget.Panel("popup", {
    close: c,
    width: w,
    fixedcenter: true,
    draggable: false,
    zindex: 4,
    modal: true,
    visible: false
  });
  pop.setHeader(header);
  pop.setBody(body);
  pop.render(document.body);
  pop.show();
  
  return pop;
}

function logoutPop() {
  Weave.Xfer = {};
  var hdr = "You have been logged out";
  var msg = "<p>Please close this browser window to ensure the safety of your data!</p>";
  showPopup(hdr, msg);
}

function securityPop() {
  var hdr = "Weave Security";
  var msg = "<p>Description of how weave decrypts data goes here.</p>";
  showPopup(hdr, msg, true, "500px");
}

var hdr = "Decrypting your data, please wait..."
var msg = '<img src="images/loading.gif" />';
var lod = showPopup(hdr, msg);
/*
var lbu = new YAHOO.widget.Button("logout");
lbu.on("click", logoutPop);
*/
decrypt();
