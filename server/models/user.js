const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    avt_url: {
        type: String,
    },
    // public_key: {
    //     type: Object,
    // },
    // private_key: {
    //     type: String,
    // },
});

module.exports = mongoose.model("User", UserSchema);
