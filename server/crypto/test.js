const RSA = require("./RSA");
const sha256 = require("./SHA256");

const message = "Hello World";
const RSA_key = RSA.generate(250);

const RSA_encrypted_message = RSA.encrypt(
    RSA.encode(message),
    RSA_key.n,
    RSA_key.e
);
console.log("Cipher text", RSA_encrypted_message.value);

const RSA_decrypted_message = RSA.decode(
    RSA.decrypt(RSA_encrypted_message, RSA_key.d, RSA_key.n)
);
console.log("Plain text", RSA_decrypted_message);

const SHA256_hash = sha256.hash(message);
console.log("Hashed", SHA256_hash);
