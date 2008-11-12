<?php
require_once "HTTP/WebDAV/Client.php";

class WeaveClient
{
	private $api_key;
	private $secret;
	private $passphrase;
     
	private $dav;
  private $privatekey;

	private $bookmarks_keyring;
	private $bookmarks_symmetric_key;
	private $bookmarks_store;
	private $bookmarks_deltas;
	private $bookmarks_status;

	public function __construct($api_key, $secret, $passphrase, $server) {
		$this->service_url = 'webdavs://' . urlencode($api_key) . ':' . $secret . '@' . $server;
		$this->api_key = $api_key;
		$this->secret = $secret;
		$this->passphrase = $passphrase;
	}

	public function getBookmarks($user_id) {
		return $this->bookmarks_store();
	}

	public function getBookmarksFolders($user_id) {
		$bookmarks = $this->get_bookmarks_store($user_id);
		foreach ($bookmarks as $guid => $bookmark) {
			if((isset($bookmark->{'type'}) && $bookmark->{'type'} == "folder") && (isset($bookmark->{'parentGUID'}) && $bookmark->{'parentGUID'} == "menu")) {
				$folders{$guid} = $bookmark;
			}
		}
		return (isset($folders) ? $folders : null);
	}

	public function getBookmarksFolderContents($user_id, $folder) {
		$bookmarks = $this->get_bookmarks_store($user_id);
		foreach ($bookmarks as $guid => $bookmark) {
			if(isset($bookmark->{'type'}) && $bookmark->{'type'} == "bookmark") {
				if(isset($bookmark->{'parentGUID'}) && $bookmark->{'parentGUID'} == $folder) {
					$items{$guid} = $bookmark;
				}
			}
		}
		return (isset($items) ? $items : null);
	}

	public function createBookmarksFolder($user_id, $foldername, $parent) {
		$parents = $parent; // XXX	
		$deltas_json = '[{"action":"create","GUID":"{'.md5(uniqid()).'}","depth":1,"parents":["'.$parents.'"],"data":{"parentGUID":"menu","index":null,"type":"folder","title":"'.$foldername.'"}}]';	
		$this->put_bookmarks_delta($user_id, $deltas_json);
	}

	public function createBookmark($user_id, $url, $title, $parent) {
		$parents = $parent; // XXX
		$deltas_json = '[{"action":"create","GUID":"{'.md5(uniqid()).'}","depth":1,"parents":["'.$parents.'"],"data":{"parentGUID":"'.$parents.'","index":null,"type":"bookmark","title":"'.$title.'","URI":"'.$url.'","tags":[],"keyword":null}}]';
		$this->put_bookmarks_delta($user_id, $deltas_json);
	}


	private function get_bookmarks_store($user_id) {
		if(!$this->bookmarks_store[$user_id]) {
			$encrypted_bookmarks_symmetric_key = $this->get_bookmarks_keyring($user_id)->{'ring'}->{sha1($this->api_key)};
			openssl_private_decrypt(base64_decode($encrypted_bookmarks_symmetric_key), $bookmarks_symmetric_key, $this->get_privatekey()) or die(openssl_error_string());


			$status_fh = fopen($this->service_url . sha1($user_id) . '/user-data/bookmarks/status.json', "r+") or die;
			$status_json = stream_get_contents($status_fh);
			$status = json_decode($status_json);

			$snapshot_fh = fopen($this->service_url . sha1($user_id) . '/user-data/bookmarks/snapshot.json', "r+") or die;
			$encrypted_bookmarks = stream_get_contents($snapshot_fh);
			$bookmarks_json = $this->symmetric_decrypt($encrypted_bookmarks, $bookmarks_symmetric_key);
			$bookmarks = json_decode($bookmarks_json);

			$deltas_fh = fopen($this->service_url . sha1($user_id) . '/user-data/bookmarks/deltas.json', "r+") or die;
			$encrypted_deltas = stream_get_contents($deltas_fh);
			$deltas_json = $this->symmetric_decrypt($encrypted_deltas, $bookmarks_symmetric_key);
			$deltas = json_decode($deltas_json);
echo "<hr/>";
echo "<b>users in this context:</b> <pre>$this->api_key => ".sha1($this->api_key)."<br/>$user_id => ".sha1($user_id)."</pre>";
echo "<b>$user_id's keyring:</b> <pre>".json_encode($this->get_bookmarks_keyring($user_id)->{'ring'})."</pre>";
echo "<b>$this->api_key's unencrypted symmetric key in $user_id's keyring:</b> <pre>$bookmarks_symmetric_key</pre>";
echo "<b>$user_id's status.json: </b> <pre>$status_json</pre>";
echo "<b>$user_id's snapshot.json: </b> <pre>$bookmarks_json</pre>";
echo "<b>$user_id's deltas.json: </b> <pre>$deltas_json</pre>";
echo "<hr/><br/>";
			if($deltas) {
				foreach($deltas as $delta) {
        				$bookmarks = $this->apply_commands_to_object($delta, $bookmarks);
				}
			}

			$this->bookmarks_symmetric_key[$user_id] = $bookmarks_symmetric_key;
			$this->bookmarks_store[$user_id] = $bookmarks;
			$this->bookmarks_deltas[$user_id] = $deltas_json;
			$this->bookmarks_status[$user_id] = $status;
		}
		return $this->bookmarks_store[$user_id];
	}

	private function get_privatekey() {
		if(!$this->privatekey) {
			$encrypted_priv_key = file_get_contents($this->service_url . sha1($this->api_key) . '/private/privkey');
			$priv_key_id = openssl_get_privatekey($encrypted_priv_key, $this->passphrase);
			$this->privatekey = $priv_key_id;
		}

		return $this->privatekey;
	}

	private function get_bookmarks_keyring($user_id) {
		if(!$this->bookmarks_keyring[$user_id]) {
			$bookmarks_keyring_json = file_get_contents($this->service_url . sha1($user_id) . '/user-data/bookmarks/keys.json');
			$bookmarks_keyring = json_decode($bookmarks_keyring_json);
			$this->bookmarks_keyring[$user_id] = $bookmarks_keyring;
		} 

		return $this->bookmarks_keyring[$user_id];
	}

	private function symmetric_decrypt($data, $key) {
		file_put_contents("decrypt_data", $data);
		file_put_contents("decrypt_key", $key);
		shell_exec("openssl aes-256-cbc -d -a -salt -in decrypt_data -out decrypt_result -pass file:decrypt_key");
		$data = file_get_contents("decrypt_result");
		unlink("decrypt_data");
		unlink("decrypt_key");
		unlink("decrypt_result");

		return $data;
	}

	private function symmetric_encrypt($data, $key) {
		file_put_contents("encrypt_data", $data);
		file_put_contents("encrypt_key", $key);
		shell_exec("openssl aes-256-cbc -e -a -salt -in encrypt_data -out encrypt_result -pass file:encrypt_key");
		$data = file_get_contents("encrypt_result");
		unlink("encrypt_data");
		unlink("encrypt_key");
		unlink("encrypt_result");

		return $data;
	}

	private function apply_commands_to_object($commands, $object) {
                foreach($commands as $command) {
                        switch($command->{'action'}) {
                                case "create":
				$object->{$command->{'GUID'}} = $command->{'data'}; 
                                break;

                                case "edit":
				if(isset($command->{'data'}->{'GUID'})) {
					$newGUID = $command->{'data'}->{'GUID'};
					$oldGUID = $command->{'GUID'};

					$object->{$newGUID} = $object->{$oldGUID};
					unset($object->{$oldGUID});

					foreach($object->{'GUID'} as $obj) {
						if($obj->{'parentGUID'} == $oldGUID) 
							$obj->{'parentGUID'} == $newGUID;
					}
				}
				foreach($command->{'data'} as $key => $property) {
					if($key == "GUID") 
						continue;

					$object->{$command->{'GUID'}}->{$key} = $property;		
				}
                                break;

				case "remove":
				unset($object->{$command->{'GUID'}});
				break;
                        }
                }

		return $object;
        }

	private function put_bookmarks_delta($user_id, $deltas_json) {
		$bookmarks = $this->get_bookmarks_store($user_id);

		if($this->bookmarks_status[$user_id]->{'maxVersion'} == 0) {
			$deltas_json = '[' . $deltas_json . ']';
		} else {
			$deltas_json = rtrim($this->bookmarks_deltas[$user_id],"]") . '],' . $deltas_json . ']';
		}

		$deltas = $this->symmetric_encrypt($deltas_json, $this->bookmarks_symmetric_key[$user_id]);
		$deltas_fh = fopen($this->service_url . sha1($user_id) . '/user-data/bookmarks/deltas.json', 'w+');
		fwrite($deltas_fh, $deltas);

		$this->bookmarks_status[$user_id]->{'maxVersion'} = $this->bookmarks_status[$user_id]->{'maxVersion'} + 1;
		$this->bookmarks_status[$user_id]->{'itemCount'} = $this->bookmarks_status[$user_id]->{'itemCount'} + 1;
		$this->bookmarks_status[$user_id]->{'deltasEncryption'} = "aes-256-cbc";

		$status = json_encode($this->bookmarks_status[$user_id]);
		$status_fh = fopen($this->service_url . sha1($user_id) . '/user-data/bookmarks/status.json', 'w+');
		fwrite($status_fh, $status);
	}

}


?>

