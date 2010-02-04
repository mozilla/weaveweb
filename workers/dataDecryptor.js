importScripts("util.js", "aes.js", "rsa/jsbn.js", "rsa/jsbn2.js", "rsa/prng4.js", "rsa/rng.js", "rsa/rsa.js", "rsa/rsa2.js");

// Get symmetric key.
function getSymmetricKey(aPrivateKey, aKeyRing) {
  var rsa = new RSAKey();
  rsa.setPrivateEx(
    aPrivateKey[0], aPrivateKey[1], aPrivateKey[2], aPrivateKey[3],
    aPrivateKey[4], aPrivateKey[5], aPrivateKey[6], aPrivateKey[7]);

  symmetricKey = Weave.Util.Base64.decode(aKeyRing);
  symmetricKey = Weave.Util.StH(symmetricKey);
  symmetricKey = rsa.decrypt(symmetricKey);
  symmetricKey = Weave.Util.intify(symmetricKey);

  return symmetricKey;
}

// Use AES to decrypt the given data.
function aesDecrypt(aSymmetricKey, aDecodedBulkIV, aDecodedData) {
  return Weave.Crypto.AES.decrypt(aSymmetricKey, aDecodedBulkIV, aDecodedData);
}

onmessage = function(aEvent) {
  var privateKey = aEvent.data.privateKey;
  var bulkIV = aEvent.data.bulkIV;
  var keyRing = aEvent.data.keyRing;
  var cipherText = aEvent.data.cipherText;

  var symmetricKey = getSymmetricKey(privateKey, keyRing);
  if (!symmetricKey) {
    postMessage({ "message" : "No symmetric Key" });
    throw "No symmetric Key";
  }

  var decodedBulkIV = Weave.Util.Base64.decode(bulkIV);
  var decodedData = Weave.Util.Base64.decode(cipherText);
  var decryptedData = aesDecrypt(symmetricKey, decodedBulkIV, decodedData);
  if (!decryptedData) {
    postMessage({ "message" : "No data" });
    throw "No data";
  }

  postMessage({
    decryptedData: decryptedData,
    privateKey: privateKey,
    collectionName: aEvent.data.collectionName });
}
