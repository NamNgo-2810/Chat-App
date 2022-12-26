String.prototype.hashCode = function () {
    var hash = 0,
        i,
        chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function xorEncrypt(data, key) {
    // Convert data and key to integers
    const dataInt = parseInt(data);
    const keyInt = key.hashCode();
    // Encrypt the data by XORing it with the key
    const encryptedDataInt = dataInt ^ keyInt;
    // Return the encrypted data as a string
    return encryptedDataInt.toString();
}

function xorDecrypt(encryptedData, key) {
    // Convert encrypted data and key to integers
    const encryptedDataInt = parseInt(encryptedData);
    const keyInt = key.hashCode();
    // Decrypt the data by XORing it with the key
    const decryptedDataInt = encryptedDataInt ^ keyInt;
    // Return the decrypted data as a string
    return decryptedDataInt;
}

// const key = "admin123";
// const data = 3;
// const encryptedData = xorEncrypt(data, key);
// console.log(encryptedData); // Output: "120"
// const decryptedData = xorDecrypt(encryptedData, key);
// console.log(decryptedData); // Output: "3"

module.exports = {
    xorEncrypt: xorEncrypt,
    xorDecrypt: xorDecrypt,
};
