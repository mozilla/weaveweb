<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en">
<head>
	<title>Mozilla Labs / Weave / Forgot Password</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <link rel='stylesheet' href='css/weave.css' type='text/css' media='all' />
</head>
<body>
  
<img class="centered" src="images/weave-header.png" />

<div id="content">


<?php

include_once 'ldap.php';

$form = <<<EOD
<div class="box">
<form class="mainForm" name="forgotPass" id="forgotPass" action="forgot.php" method="post">
<p>
	<label>Enter your username to begin<br />
	<input type="text" name="uid" id="user_login" size="20" /></label>
</p>
<p class="submit">
	<input type="submit" id="fpsubmit" name="fpsubmit" value="Submit" />
</p>
<p>&nbsp;</p>
</form>
</div>
EOD;

if (!isset($_POST['uid'])) {
  echo $form;
} else {
  $ldap = new MozLDAP('localhost', 'mail=oremj@mozilla.com,c=mpt,dc=mozilla', 'tester');
  if (!$ldap->valueExists('uid', $_POST['uid'])) {
    echo '<div class="error">That userID does not exist.</div>';
    echo $form;
  } else {
    $mail = $ldap->getAttribute($_POST['uid'], 'mail');
    if (!$mail) {
      echo '<div class="error">You did not specify an email address when you registered. Sorry, you cannot reset your password!</div>';
      echo $form;
    } else {
      $uid = urlencode($_POST['uid']);
      $key = sha1(mt_rand().$_POST['uid']);
      $ldap->setAttribute($_POST['uid'], 'mail-verified', $key);
      
      $headers  = 'MIME-Version: 1.0' . "\r\n";
      $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
      $headers .= 'From: Mozilla Labs <noreply@mozilla.com>' . "\r\n";

      $message = <<<EOT
Mozilla Labs Account Password Reset\r\n
Please visit\r\n
https://services.mozilla.com/reset.php?key=$key&uid=$uid\r\n
to reset your account password.\r\n
EOT;

      mail($mail[0], 'Mozilla Labs Account Password Reset: services.mozilla.com', $message, $headers);
      
      $msg = <<<EOT
<div class="box">
<form class="mainForm">
<p>
  <label>Further instructions have been sent to your email address.</label>
</p>
</form>
</div>
EOT;
      echo $msg;
    }
  }
}

?>

</div>
<div id="footer">
  <p>
    <a href="https://services.mozilla.com/">Take me back to the Weave home page</a>
  </p>
  <br />
  <p>&copy; 2008, Mozilla</p>
  <p>
    <a href="http://www.mozilla.com/en-US/about/legal.html">Legal Notices</a>
    |
    <a href="http://www.mozilla.org/privacy/websites/">Privacy Policy</a>
  </p>
</div>

</body>
</html>