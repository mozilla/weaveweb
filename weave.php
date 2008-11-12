<?php

include 'HTTP/WebDAV/Client.php';

//error_reporting(E_NONE);

if (isset($_POST['log'])) {
  $user = urlencode($_POST['usr']);
  $pass = $_POST['pwd'];
  $serv = $_POST['srv'];
  
  $uri = "webdavs://$user:$pass@$serv/user/$user/";
  $ver = file_get_contents($uri."meta/version");
  
  if (!$ver) {
    /* Try again without https */
    $uri = "webdav://$user:$pass@$serv/user/$user/";
    $ver = file_get_contents($uri."meta/version");
  }
  
  if ($ver) {
    /* Setup the JSON to pass to client */
    $pkey = file_get_contents($uri."private/privkey");
    $bms = getJSON($uri, "bookmarks");
    $ses = getJSON($uri, "tabs");
    printHome($pkey, $bms, $ses, $_POST['usr'], $serv);
  } else {
    header("Location: index.php?error=1");
  }
} else {
  header("Location: index.php");
}

function getJSON($uri, $which) {
  $keys = file_get_contents($uri."user-data/$which/keys.json");
  if ($keys) {
    $stat = file_get_contents($uri."user-data/$which/status.json");
    $snap = file_get_contents($uri."user-data/$which/snapshot.json");

    $check = json_decode($stat, true);
    if ($check['snapEncryption'] != "none") 
      $snap = json_encode(file_get_contents($uri."user-data/$which/snapshot.json"));
      
    return array($keys, $stat, $snap);
  } else {
    return array(false, false, false);
  }
}

function printHome($pkey, $bmarks, $tabs, $user, $server)
{
  $time = date(DATE_RFC822);
  if (empty($pkey)) {
    $pkey = "false";
  }
  if (!$bmarks[0]) {
    $bmarks = array("false", "false", "false");
  }
  if (!$tabs[0]) {
    $tabs = array("false", "false", "false");    
  }
  
  $page = <<<EOT
<html>
<head>
  <title>Weave / Home</title>
  
  <!-- Weave Import -->
  <script type="text/javascript" src="weave/util.js"></script>
  <script type="text/javascript" src="weave/pkcs5v2.js"></script>
  <script type="text/javascript" src="weave/aes.js"></script>
  <script type="text/javascript" src="weave/asn1.js"></script>

  <!-- RSA Import -->
  <script type="text/javascript" src="weave/rsa/jsbn.js"></script>
  <script type="text/javascript" src="weave/rsa/jsbn2.js"></script>
  <script type="text/javascript" src="weave/rsa/prng4.js"></script>
  <script type="text/javascript" src="weave/rsa/rng.js"></script>
  <script type="text/javascript" src="weave/rsa/rsa.js"></script>
  <script type="text/javascript" src="weave/rsa/rsa2.js"></script>
  
  <!-- ProtoFlow -->
  <script type="text/javascript" src="proto/prototype.js"></script>
  <script type="text/javascript" src="proto/scriptaculous.js"></script>
  <script type="text/javascript" src="proto/reflection.js"></script>
  <script type="text/javascript" src="proto/protoFlow.js"></script>
  <link rel="stylesheet" type="text/css" href="proto/protoFlow.css" />
  
  <!-- YUI Import -->
  <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.5.2/build/assets/skins/sam/skin.css" />
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/yahoo-dom-event/yahoo-dom-event.js"></script>
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/element/element-beta-min.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/button/button-min.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/container/container-min.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/json/json-min.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/tabview/tabview-min.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/treeview/treeview-min.js"></script>
  
  <link rel="stylesheet" type="text/css" href="css/main.css" />
  <!-- Load up the JSON -->
  <script type="text/javascript">
    Weave.Xfer = {
      user: '$user',
      key: $pkey,
      bmk: {
        keys: $bmarks[0],
        stat: $bmarks[1],
        snap: $bmarks[2]
      },
      tab: {
        keys: $tabs[0],
        stat: $tabs[1],
        snap: $tabs[2]
      }
    };
  </script>
</head>
<body class="yui-skin-sam">
  <div class="user-msg">
    You are logged in as <b>$user@$server</b>
  </div>
  <div id="container"></div>
  <div id="message">
    <table class="msg">
      <tr>
        <td>
          <a href="javascript:securityPop()">
          <img border="none" src="images/clear-lock.png" />
          </a>
        </td>
        <td>&nbsp;</td>
        <td>
          Your data has been safely decrypted by your web browser. To learn more about how Weave 
          keeps your data safe, click the lock icon.<br />
          <b>To <a href="javascript:logoutPop()">logout</a>, simply close this page!</b><br />
          Last updated: $time
        </td>
      </tr>
    </table>
  </div>
  <div class="img-footer">
    Powered By <br />
    <a href="http://labs.mozilla.com/"><img border="none" src="images/weave-footer.png" /></a>
  </div>
</body>
  <!-- Let's get cracking! -->
  <script src="weave.js" language="javascript"></script>
</html>
EOT;

  echo $page;
}

?>