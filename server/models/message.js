const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
        },
        sender: {
            type: String,
        },
        senderId: {
            type: Number,
        },
        contentType: {
            type: String,
        },
        content: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("message", messageSchema);
