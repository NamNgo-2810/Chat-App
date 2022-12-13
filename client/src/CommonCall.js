import axios from "axios";
// import * as fs from "fs";
// import * as os from "os";
const RSA = require("../src/RSA");

const SECRET_KEY = "SECRET_KEY";
// const setEnvValue = (key, value) => {
//     // read file from hdd & split if from a linebreak to a array
//     const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

//     // find the env we want based on the key
//     const target = ENV_VARS.indexOf(
//         ENV_VARS.find((line) => {
//             return line.match(new RegExp(key));
//         })
//     );

//     // replace the key/value with the new value
//     ENV_VARS.splice(target, 1, `${key}=${value}`);

//     // write everything back to the file system
//     fs.writeFileSync("../.env", ENV_VARS.join(os.EOL));
// };

export const register = async (username, password) => {
    const key = RSA.generate(250);
    const public_key = { e: key.e, n: key.n };

    const res = await axios.post(process.env.API_URI + `signup`, {
        username: username,
        password: password,
        public_key: public_key,
    });

    // if (res.status == 200) {
    //     setEnvValue(SECRET_KEY, key.d);
    // }

    return res;
};

export const login = async (username, password) => {
    const res = await axios.post(process.env.API_URI + `login`, {
        username: username,
        password: password,
    });

    return res;
};

export const getConversationOfUser = async (user_id) => {
    const res = await axios.get(
        process.env.API_URI + `conversation?userId=${user_id}`
    );

    return res;
};

export const sendMessage = async (data) => {
    const res = await axios.post(process.env.API_URI + "message/send", data, {
        headers: {
            x_authorization: localStorage.getItem("access_token"),
        },
    });

    return res;
};

export const getMessages = async (conversation_id) => {
    const res = await axios.get(
        process.env.API_URI + `/message?conversationId=${conversation_id}`,
        { headers: { x_authorization: localStorage.getItem("access_token") } }
    );
    if (res.messages) {
        const decrypted_messages = res.messages.map((message) => {
            return RSA.decode(
                RSA.decrypt(message, process.env.SECRET_KEY, res.public_key.n)
            );
        });
        res.messages = decrypted_messages;

        return res;
    }
};
