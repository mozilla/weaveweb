<?php
header('Content-Type: text/plain');
$username = $_GET['username'];
$password = $_GET['password'];
$url = $_GET['url'];


// append all other parameters to the url
$additionalParams = '';
$separator = '?';

foreach ($_GET as $key => $value) {
  if (($key != 'username') && ($key != 'password') &&
      ($key != 'url')) {
    $additionalParams = $additionalParams . $separator . $key . '=' .$value;
    $separator = '&';
  }
}
$url = $url . $additionalParams;


// create a new cURL resource.
$resource = curl_init($url);

// return the transfer as a string of the return value of curl_exec()
// instead of outputting it out directly.
curl_setopt($resource, CURLOPT_RETURNTRANSFER, true);

// stop cURL from verifying the peer s certificate.
curl_setopt($resource, CURLOPT_SSL_VERIFYPEER, false);

// array of HTTP header fields to set.
curl_setopt($resource, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json'));

// sets the credentials.
curl_setopt($resource,CURLOPT_USERPWD,$username . ':' . $password);

// perform the cURL session.
$result = curl_exec($resource);

// get information regarding the previous transfer.
$headers = curl_getinfo($resource);

// closes the cURL session.
curl_close($resource);

foreach ($headers as $h) {
  // sends the raw HTTP header to the client.
  header($h);
}

echo $result;
?>
