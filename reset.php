<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en">
<head>
	<title>Weave / Reset Password</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <link rel='stylesheet' href='css/weave.css' type='text/css' media='all' />
</head>

<body>

<img class="centered" src="images/weave-header.png" />

  
<div id="content">

<?php

require_once 'ldap.php';

$ldap = new MozLDAP('localhost', 'mail=oremj@mozilla.com,c=mpt,dc=mozilla', 'tester');

if (isset($_GET['key']) && isset($_GET['uid']) && !isset($_POST['key'])) {
  if (!$ldap->valueExists('uid', $_GET['uid'])) {
    echo '<div class="error">That userID does not exist.</div>';
  } else {
    $key = $ldap->getAttribute($_GET['uid'], 'mail-verified');
    $key = $key[0];
    $uid = trim($_GET['uid']);

    if ($key == $_GET['key']) {
      $form = <<<EOT
<div class="box">
<form class="mainForm" name="changePass" id="changePass" action="reset.php" method="post">
<p>
  <label>Please choose your new password<br />
  <input type="password" name="pass" id="user_pass" size="20" /></label>
</p>
<p>
  <label>Re-enter to confirm<br />
  <input type="password" name="pass2" id="user_pass2" size="20" /></label>
</p>
<input type="hidden" name="key" value="$key" />
<input type="hidden" name="uid" value="$uid" />
<p class="submit">
  <input type="submit" id="pchange" name="pchange" value="Change my password" />
</p>
<p>&nbsp;</p>
</form>
</div>
EOT;
      echo $form;
    } else {
      echo '<div class="error">Incorrect Key!</div>';
    }
  }
} else if (isset($_POST['key']) && isset($_POST['pass'])) {
  $key = $ldap->getAttribute($_POST['uid'], 'mail-verified');
  if ($key[0] == $_POST['key']) {
    $ldap->changePassword($_POST['uid'], $_POST['pass']);
    $ldap->setAttribute($_POST['uid'], 'mail-verified', 'Yes');
    $toShow = <<<EOT
<div class="box">
<p>
  <b>Your password has been changed successfully!</b>
</p>
</div>
EOT;
    echo $toShow;
  }
} else {
  $toShow = <<<EOT
<div class="error">
<p>
  <label>Invalid Key!</label>
</p>
</div>
EOT;
  echo $toShow;
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
    <a href="http://www.mozilla.com/en-US/privacy-policy.html">Privacy Policy</a>
  </p>
</div>

</div>
</body>
</html>