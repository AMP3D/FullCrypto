var FullCrypto = function () {
	FullCrypto.prototype.getSHA256 = function(text) {
		var sha256 = CryptoJS.SHA256(text);

		return sha256;
	}

	FullCrypto.prototype.decrypt = function(text, key) {		
		var bytes = CryptoJS.AES.decrypt(text.toString(), key);
		var decryptedText = bytes.toString(CryptoJS.enc.Utf8);

		return decryptedText;
	}

	FullCrypto.prototype.encrypt = function(text, key) {		
		var encryptedText = CryptoJS.AES.encrypt(text, key);
		
		return encryptedText;
	}
}