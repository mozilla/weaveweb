importScripts("util.js", "aes.js", "pkcs5v2.js", "asn1.js");

/**
 * Decrypt a private key.
 * @ param aPrivateKey the key to be decrypted.
 * @param apassphrase the passphrase used during encryption.
 */
function decryptPrivateKey(aPrivateKey, aPassphrase) {
  var salt = Weave.Util.Base64.decode(aPrivateKey.salt);
  var passkey =
    Weave.Crypto.PKCS5.generate(aPassphrase, salt, 4096, 32);
  var keyData;

  if (!passkey) {
    postMessage({ message: "Couldn't generate key!" });
    throw "Couldn't generate key!";
  }

  // XXX : the API returns different variable names.
  keyData = aPrivateKey.keyData ? aPrivateKey.keyData : aPrivateKey.key_data;

  var rsaKey = Weave.Util.Base64.decode(keyData);
  var rsaIV = Weave.Util.Base64.decode(aPrivateKey.iv);
  var unwrappedRSAKey = Weave.Crypto.AES.decrypt(passkey, rsaIV, rsaKey);

  if (!unwrappedRSAKey) {
    postMessage({ message: "Couldn't unwrapping RSA key..." });
    throw "Couldn't unwrapping RSA key...";
  }


  var privateKey = Weave.Crypto.ASN1.PKCS1.parse(unwrappedRSAKey);

  if (!privateKey) {
    postMessage({ message: "Incorrect passphrase!" });
    throw "Incorrect passphrase!";
  }

  return privateKey;
}

onmessage = function(aEvent) {
  var privateKey = aEvent.data.privateKey;
  var passphrase = aEvent.data.passphrase;

  postMessage({ privateKey: decryptPrivateKey(privateKey, passphrase) });
}
