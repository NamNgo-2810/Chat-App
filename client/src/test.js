const CryptoJS = require("crypto-js");

// Encrypt the data
var data =
    "105158983978550267316282715733165275724162050877052583640962142238772084193";
var key = "admin123";

var encrypted = CryptoJS.AES.encrypt(data, key).toString();

// Decrypt the data
var decrypted = CryptoJS.AES.decrypt(encrypted, key);
var plaintext = decrypted.toString(CryptoJS.enc.Utf8);

console.log("Ciphertext: " + encrypted);
console.log("Plaintext: " + plaintext); // Output: "Hello, World!"
