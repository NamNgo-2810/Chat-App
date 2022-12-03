const mongoose = require("mongoose");
require("dotenv").config();

const connect = async () => {
    try {
        mongoose.connect(
            process.env.MONGO_URI,
            {
                useNewUrlParser: true,
                useUnfiedTopology: true,
            },
            () => {
                console.log("MongoDB connected success");
            }
        );
    } catch (error) {
        console.log("error", error);
    }
};
