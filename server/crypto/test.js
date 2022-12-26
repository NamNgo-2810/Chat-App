const RSA = require("./RSA");
const bigInt = require("big-integer");
const sha256 = require("./SHA256");

const message = "alo";
// const RSA_key = RSA.generate(250);

const RSA_encrypted_message = RSA.encrypt(
    RSA.encode(message),
    bigInt(
        "841328031261641088801164418534596329670113807424055232024682201409029643583"
    ),
    bigInt("65537")
);
console.log("Cipher text", RSA_encrypted_message.value);

const RSA_decrypted_message = RSA.decode(
    RSA.decrypt(
        RSA_encrypted_message,
        bigInt(
            "122554866285881261899208838502580419610570786134860335255171010278348380673"
        ),
        bigInt(
            "841328031261641088801164418534596329670113807424055232024682201409029643583"
        )
    )
);
console.log("Plain text", RSA_decrypted_message);

// const SHA256_hash = sha256.hash(message);
// console.log("Hashed", SHA256_hash);
