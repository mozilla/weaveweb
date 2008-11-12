<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en">
<head>
	<title>Weave / Login</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

  <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.5.2/build/button/assets/skins/sam/button.css" />  
  <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.5.2/build/container/assets/skins/sam/container.css" />
  <link rel='stylesheet' href='css/login.css' type='text/css' media='all' />
  
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/yahoo-dom-event/yahoo-dom-event.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/element/element-beta-min.js"></script> 
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/button/button-min.js"></script>
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/connection/connection-min.js"></script>
  <script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/container/container-min.js"></script>
</head>
<body class="login yui-skin-sam">

<!-- <img src="images/weave-logo.png" class="icon" /> -->
<!-- <div id="logo"><img src="images/weave-sign.png"/></div> -->

<div id="login">
<div id="error"></div>

<div id="farum">
<form class="mainForm" name="loginform" id="loginform" action="weave.php" method="post">
	<p>
		<label>Username<br />
		<input type="text" name="usr" id="user_login" class="input" value="" size="20" /></label>
	</p>
	<p>
		<label>Password<br />
		<input type="password" name="pwd" id="user_pass" class="input" value="" size="20" /></label>
	</p>
	<p>
		<label>Server<br />
		<input type="server" name="srv" id="user_server" class="input" value="services.mozilla.com/0.2" size="30" /></label>
	</p>
  <div id="register"></div>
	<p class="submit">
		<div id="fsubm"></div>
		<input type="hidden" name="log" id="user_log" value="1" />
	</p>
</form>
</div>

</div>

<div id="footer">
  <p>
    Weave is an experimental prototype from Mozilla Labs that integrates online services with Firefox.<br />
    <a href="http://labs.mozilla.com/">Learn more</a> about the Weave project, or join us at the Mozilla Labs
    <a href="https://labs.mozilla.com/forum/index.php/board,19.0.html">discussion forum</a> to provide feedback and suggestions.
  </p>
  <br />
  <p>
    Looking for the <a href="http://people.mozilla.com/~cbeard/weave/dist/latest-weave.xpi">addon</a>?
  </p>
</div>

</body>

<script type="text/javascript">
  var errors = [];
  var errDiv = document.getElementById('error');
  document.loginform.usr.focus();
  
  function preloadImages() {
    var spinnerImg = new Image();
    spinnerImg.src = "images/spinner.gif";
    var loadingImg = new Image();
    loadingImg.src = "images/loading.gif";
  }
  preloadImages();
  
  function showErrors() {
    var msgs = [
      'Incorrect username or password',
      'Username is already taken',
      'Email addresses do not match',
      'Passwords do not match',
      'Registration server could not be reached, please try again later',
      'Missing User ID',
      'Invalid User ID',
      'Invalid email address',
      'An account with that email address already exists',
      'Missing reCAPTCHA challenge',
      'Missing reCAPTCHA response',
      'Missing Password',
      'Some files are missing from your Weave profile!'
    ];
    
    if (errors.length > 0) {
      var html = '<ul>';
      for (var i = 0; i < errors.length; i++) {
        html += '<li>';
        html += msgs[errors[i]];
        html += '</li>';
      }
      html += '</ul>';
      errDiv.innerHTML = html;
      errDiv.style.display = "block";
    } else {
      errDiv.innerHTML = "";
      errDiv.style.display = "none";
    }
  }
  
  function addError(code) {
    var found = 0;
    for (var i; i < errors.length; i++) {
      if (errors[i] == code)
        found = 1;
    }
    if (!found)
      errors[errors.length] = code;
    showErrors();
  }
  
  function removeError(code) {
    var i = 0;
    while (i < errors.length) {
      if (errors[i] == code) {
        errors.splice(i, 1);
      } else {
        i++;
      }
    }
    showErrors();
  }
  
<?php
  if (isset($_GET['error'])) {
    switch ($_GET['error']) {
      case 1:
        echo "addError(0);";
        break;
      case 2:
        echo "addError(12);";
        break;
    }
  }
?>
  
  function showWaitAndSubmit() {
    var wait = new YAHOO.widget.Panel("wait", {
      width: "240px",
      fixedcenter: true,
      close: false,
      draggable: false,
      zindex: 4,
      modal: true,
      visible: false
    });
    wait.setHeader("Please wait while we log you in...");
    wait.setBody('<img src="images/loading.gif" />');
    wait.render(document.body);
    wait.show();
    
    /* Wait 100 ms for GIF to render */
    YAHOO.lang.later(100, document.loginform, 'submit');
  }
  
  function registrationSubmit() {
    errors = [];
    showErrors();
    
    var div = document.getElementById('rsubm');
    div.innerHTML = '<img src="images/spinner.gif" />';
    
    var cap = document.getElementById('captcha').contentDocument;
    var res = cap.getElementById('recaptcha_response_field').value;
    var cha = cap.getElementById('recaptcha_challenge_field').value;
    
    var msg = 'uid=' + encodeURIComponent(document.regform.user_login.value);
    msg += '&password=';
    msg += encodeURIComponent(document.regform.user_pass.value);
    msg += '&recaptcha_response_field=';
    msg += encodeURIComponent(res);
    msg += '&recaptcha_challenge_field=';
    msg += encodeURIComponent(cha);
    
    if (document.regform.email.value.length > 0) {
      msg += '&mail=';
      msg += encodeURIComponent(document.regform.email.value);
    }

    YAHOO.util.Connect.initHeader('Content-Type', 'application/x-www-form-urlencoded');
    YAHOO.util.Connect.initHeader('Content-Length', msg.length);
    
    var url = 'https://sm-labs01.mozilla.org:81/api/register/new/';
    var callback = {
      success: function(o) {
        if (o.status == 201) {
          /* Hack up to show the result */
          var toShow = '<form><p><label>Your account has been created!</label></p>';
          if (o.responseText == "2") {
            toShow += '<p><label>Since you chose to specify an email address, a confirmation email has been sent.';
            toShow += 'Following the instructions on the email will enable you to recover your password in case you forget it.</label></p>';
          } else {
            toShow += '<p><label>Since you chose not to specify an email address, you will not be able to recover ';
            toShow += 'your password at a later point.';
          }
          toShow += '<p><label>Enjoy your new Weave account!</label></p>';
          toShow += '<p><a href="https://sm-labs01.mozilla.org:81/client/"><label>Back to Login Page</label></a></p></form>';
          
          var div = document.getElementById('farum');
          div.innerHTML = toShow;
        }
      },
      failure: function(o) {
        if (o.status == 0) {
          addError(4);
        } else if (o.status == 400) {
          var rErrs = o.responseText.split(',');
          for (var i = 0; i < rErrs.length; i++) {
            switch (rErrs[i]) {
              case -2:
                addError(5); break;
              case -3:
                addError(6); break;
              case -4:
                addError(7); break;
              case -5:
                addError(8); break;
              case -6:
                addError(9); break;
              case -7:
                addError(10); break;
              case -8:
                addError(11); break;
            }
          }
        }
      },
      argument: null
    };
    YAHOO.util.Connect.asyncRequest('POST', url, callback, msg);
  }
  
  function showTerms() {
    var terms = new YAHOO.widget.Panel("wait", {
      width: "500px",
      close: true,
      draggable: true,
      modal: true,
      visible: false
    });
    terms.setHeader("Weave Terms of Service");
    terms.setBody('<p>Show terms of service here</p>');
    terms.render(document.body);
    terms.show();
  }
  
  function showConfirm() {
    var mail1 = document.regform.user_email.value;
    var mail2 = document.getElementById('cMail');
    if (mail1.length > 0) {
      mail2.style.display = "block";
    } else {
      document.regform.user_email2.value = "";
      mail2.style.display = "none";
      removeError(2);
    }
  }
  
  function checkUserID() {
    var id = document.regform.user_login.value;
    var url = 'https://sm-labs01.mozilla.org:81/api/register/check/' + id;
    var callback = {
      success: function(o) {
        if (o.responseText != "1") {
          addError(1);
        } else {
          removeError(1);
        }
      },
      failure: function(o) {
        /* we silently ignore, relying on server-side checks */
      },
      argument: null
    };
    YAHOO.util.Connect.asyncRequest('GET', url, callback, null);
  }
  
  function checkEmail() {
    var em1 = document.getElementById('user_email');
    var em2 = document.getElementById('user_email2');
    
    if (em2.style.display == "none") {
      removeError(2);
    } else {
      if (em1.value != em2.value) {
        addError(2);
      } else {
        removeError(2);
      }
    }
  }
  
  function checkPassword() {
    var pa1 = document.getElementById('user_pass');
    var pa2 = document.getElementById('user_pass2');
    
    if (pa1.value != pa2.value) {
      addError(3);
    } else {
      removeError(3);
    }
  }
  
  function addRegButton() {
    var register = new YAHOO.widget.Button({
      id: "user_rsubmit",
      type: "push",
      label: "Register",
      name: "rsu",
      container: "rsubm",
      onclick: {fn: registrationSubmit}
    });
  }
  
  function showForm() {
    var form = '<form name="regform" id="regform" action="https://sm-labs01.mozilla.org:81/api/register/new/" method="post">';
    form += '<p><label>Username<br /><input type="text" name="usr" id="user_login" class="input" value="';
    form += document.loginform.user_login.value + '" size="20" /></label></p>';
    form += '<p><label>Password<br />';
    form += '<input type="password" name="pwd" id="user_pass" class="input" value="';
    form += document.loginform.user_pass.value + '" size="20" /></label></p>';
    form += '<p><label>Confirm Password<br />';
    form += '<input type="password" name="pwd2" id="user_pass2" class="input" value="" size="20" /></label></p>';
    form += '<p><label>Email (Optional)<br />';
    form += '<input type="text" name="email" id="user_email" class="input" value="" size="20" /></label></p>';
    form += '<p id="cMail"><label>Confirm Email<br />';
    form += '<input type="text" name="email2" id="user_email2" class="input" value="" size="20" /></label></p>';
	  form += '<p><label>Prove that you are Human<br />';
    form += '<iframe id="captcha" scrolling="no" align="bottom" frameborder="0" width="100%" src="https://sm-labs01.mozilla.org:81/api/register/new/">';
    form += '</iframe></label></p>';
    form += '<p>Clicking the "Register" button automatically states that you agree to the ';
    form += 'Weave <a href="#" onclick="javascript: showTerms();">terms of service</a>.</p>';
    form += '<input type="hidden" id="recaptcha_challenge_field" name="recaptcha_challenge_field"></input>';
    form += '<input type="hidden" id="recaptcha_response_field" name="recaptcha_response_field"></input>';
    form += '<p><div id="rsubm"></div></p>';
    form += '</form>';
    
    var div = document.getElementById('farum');
    div.innerHTML = form;
    addRegButton();
    document.regform.usr.focus();
    
    var userID = document.getElementById('user_login');
    var userEM = document.getElementById('user_email');
    var userEC = document.getElementById('user_email2');
    var userPC = document.getElementById('user_pass2');
    
    YAHOO.util.Event.addListener(userID, "blur", checkUserID);
    YAHOO.util.Event.addListener(userEM, "blur", showConfirm);
    YAHOO.util.Event.addListener(userEC, "blur", checkEmail);
    YAHOO.util.Event.addListener(userPC, "blur", checkPassword);
    
    errors = [];
    errDiv.style.display = "none";
  }
  
  var login = new YAHOO.widget.Button({
    id: "user_submit",
    type: "push",
    label: "Log In",
    name: "sub",
    container: "fsubm",
    onclick: {fn: showWaitAndSubmit}
  });
  
  var register = new YAHOO.widget.Button({
    id: "user_register",
    type: "push",
    label: "Sign Up",
    name: "reg",
    container: "register",
    onclick: {fn: showForm}
  });
  
</script>
</html>
