<?php // -*- mode: php; c-basic-offset: 8; indent-tabs-mode: nil; -*-
require_once 'weave.php';
echo '<html><body onload="javascript:document.login.api_key.focus();">';
$api_key = urldecode($_POST['api_key']); $secret = urldecode($_POST['secret']); $passphrase = urldecode($_POST['passphrase']); $user_id = urldecode($_POST['user_id']);$server = urldecode($_POST['server']);
//$api_key="cbeard"; $secret="phoenix"; $passphrase="orion"; $user_id="thunder";

if(!$api_key || !$secret || !$passphrase || !$user_id || !$server) {
	if(!$server) {
		$server = "sandmill.org/weave/user/";
	}
	echo <<< EOQ
	<form name="login" action="index.php" method="post">
	Weave Server URL: <input type="text" name="server" value="$server"/> (default: sandmill.org/weave/user/)<br/>
	API Key: <input type="text" name="api_key" value="$api_key"/><br/>
	Secret: <input type="password" name="secret" value="$secret"/><br/>
	Encryption Passphrase: <input type="password" name="passphrase" value="$passphrase"/><br/>
	User ID: <input type="text" name="user_id" value="$user_id"/> (i.e. which user's data you are attempting to access)<br/>
	<input type="submit" value="OK"/>
	</form>
EOQ;
	return;
}

if($api_key != $user_id) {
	echo '<h1>'.$api_key.' accessing '.$user_id.'</h1><ul>';
} else {
	echo '<h1>'.$api_key.'</h1><ul>';
}

$weave = new WeaveClient($api_key, $secret, $passphrase, $server);

$add_folder = urldecode($_POST['add_folder']);
if($add_folder) {
	$weave->createBookmarksFolder($user_id, $add_folder, "menu");
	echo '<h2>'.$add_folder.' bookmarks folder created.</h2>';
echo <<< EOQ
<form action="index.php" method="post">
<input type="hidden" name="api_key" value="$api_key">
<input type="hidden" name="secret" value="$secret">
<input type="hidden" name="passphrase" value="$passphrase">
<input type="hidden" name="user_id" value="$user_id">
<input type="submit" value="Continue">
</form>
EOQ;
	return;
}

echo <<< EOQ
<form action="index.php" method="post">
<input type="hidden" name="api_key" value="$api_key">
<input type="hidden" name="secret" value="$secret">
<input type="hidden" name="passphrase" value="$passphrase">
<input type="hidden" name="user_id" value="$user_id">
Title: <input type="text" name="add_folder">
<input type="submit" value="Create Folder">
</form>
<br/>
EOQ;

$add_bookmark_url = urldecode($_POST['add_bookmark_url']);
$add_bookmark_title = urldecode($_POST['add_bookmark_title']);
if($add_bookmark_url && $add_bookmark_title) {
	$weave->createBookmark($user_id, $add_bookmark_url, $add_bookmark_title, "menu");
	echo '<h2>'.$add_bookmark_title.' bookmark created.</h2>';
echo <<< EOQ
<form action="index.php" method="post">
<input type="hidden" name="api_key" value="$api_key">
<input type="hidden" name="secret" value="$secret">
<input type="hidden" name="passphrase" value="$passphrase">
<input type="hidden" name="user_id" value="$user_id">
<input type="submit" value="Continue">
</form>
EOQ;
	return;
}

echo <<< EOQ
<form action="index.php" method="post">
<input type="hidden" name="api_key" value="$api_key">
<input type="hidden" name="secret" value="$secret">
<input type="hidden" name="passphrase" value="$passphrase">
<input type="hidden" name="user_id" value="$user_id">
URL: <input type="text" name="add_bookmark_url">
Title: <input type="text" name="add_bookmark_title">
<input type="submit" value="Create Bookmark">
</form>
<br/>
EOQ;

$folders = $weave->getBookmarksFolders($user_id);
if($folders) {
	foreach($folders as $guid => $folder) {
		echo '<li>'.$folder->{'title'}.'</li><ul>';
		$folder_items = $weave->getBookmarksFolderContents($user_id, $guid);
		if($folder_items) {
			foreach($folder_items as $item) {
				echo '<li><a href="'.$item->{'URI'}.'">'.$item->{'title'}.'</a></li>';
			}
		}
		echo '</ul>';
	}
}
$folder_items = $weave->getBookmarksFolderContents($user_id, "menu");
if($folder_items) {
	foreach($folder_items as $item) {
		echo '<li><a href="'.$item->{'URI'}.'">'.$item->{'title'}.'</a></li>';
	}
}
echo '</ul>';


//$weave->createBookmark($user_id, "http://www.puffinlabs.com/weave/", "cbeard created this", "menu");
echo '</body></html>';
?>
