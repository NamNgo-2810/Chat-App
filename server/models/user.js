const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    avt_url: {
        type: String,
    },
    public_key: {
        type: Object,
    },
});

module.exports = mongoose.model("user", userSchema);
