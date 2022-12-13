import axios from "axios";
require("dotenv").config();
const fs = require("fs");
const os = require("os");
const RSA = require("../../server/crypto/RSA");

const setEnvValue = (key, value) => {
    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(
        ENV_VARS.find((line) => {
            return line.match(new RegExp(key));
        })
    );

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync("../.env", ENV_VARS.join(os.EOL));
};

const signUp = async (username, password) => {
    const key = RSA.generate(250);
    const public_key = { e: key.e, n: key.n };

    const res = await axios.post(process.env.API_URI + `signup`, {
        username: username,
        password: password,
        public_key: public_key,
    });

    if (res.status == 200) {
        setEnvValue(SECRET_KEY, d);
    }

    return res;
};

const login = async (username, password) => {
    const res = await axios.post(process.env.API_URI + `login`, {
        username: username,
        password: password,
    });

    return res;
};

const getConversationOfUser = async (user_id) => {
    const res = await axios.get(
        process.env.API_URI + `conversation?userId=${user_id}`
    );
};

const sendMessage = async () => {};
