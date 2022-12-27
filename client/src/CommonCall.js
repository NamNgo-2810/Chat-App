import axios from "axios";
import bigInt from "big-integer";
const RSA = require("../src/RSA");
const CryptoJS = require("crypto-js");

const API_URI = "http://localhost:8080/api/";

export const register = async (username, password) => {
    const key = RSA.generate(250);
    const public_key = { e: key.e, n: key.n };
    const encrypted_private_key = CryptoJS.AES.encrypt(
        key.d.toString(),
        password
    ).toString();

    console.log(encrypted_private_key);

    const res = await axios.post(API_URI + `signup`, {
        username: username,
        password: password,
        public_key: public_key,
        private_key: encrypted_private_key,
    });

    return { status: res.status, data: res.data };
};

export const login = async (username, password) => {
    const res = await axios.post(API_URI + `login`, {
        username: username,
        password: password,
    });

    if (res.status == 200) {
        const rawPrivateKey = bigInt(
            CryptoJS.AES.decrypt(res.data.private_key, password).toString(
                CryptoJS.enc.Utf8
            )
        );
        localStorage.setItem("d_sender", rawPrivateKey);
        localStorage.setItem("n_sender", res.data.public_key.n);
    }

    return res;
};

export const getConversationOfUser = async (user_id) => {
    const res = await axios.get(API_URI + `conversation?userId=${user_id}`);

    return res;
};

export const sendMessage = async (data) => {
    const res = await axios.post(API_URI + "message/send", data, {
        headers: {
            x_authorization: localStorage.getItem("access_token"),
        },
    });

    return res;
};

export const getMessages = async (conversation_id) => {
    const res = await axios.get(
        API_URI + `/message?conversationId=${conversation_id}`,
        { headers: { x_authorization: localStorage.getItem("access_token") } }
    );
    if (res.status == 200) {
        const SECRET_KEY = {
            d: bigInt(localStorage.getItem("d_sender")),
            n: bigInt(localStorage.getItem("n_sender")),
        };
        res.data.messages.map((message) => {
            // console.log(
            //     message.contentForSender.length,
            //     message.contentForReceiver.length
            // );
            let rawContent;
            if (message.senderId == localStorage.getItem("user_id")) {
                rawContent = CryptoJS.AES.decrypt(
                    message.content.substr(0, 44),
                    localStorage.getItem("d_sender")
                ).toString(CryptoJS.enc.Utf8);
                // console.log("raw content for sender", rawContent);
            } else {
                rawContent = RSA.decode(
                    RSA.decrypt(
                        bigInt(
                            message.content.substr(
                                44,
                                message.content.length - 44
                            )
                        ),
                        SECRET_KEY.d,
                        SECRET_KEY.n
                    )
                );
                // console.log("raw content for receiver", rawContent);
            }

            message.content = rawContent;
            return message;
        });

        return res.data;
    }

    return [];
};

export const getPublicKey = async (conversation_id, sender_id) => {
    const res = await axios.get(
        API_URI +
            `/publicKey?conversationId=${conversation_id}&senderId=${sender_id}`,
        { headers: { x_authorization: localStorage.getItem("access_token") } }
    );

    return res.data;
};

export const logout = async () => {
    localStorage.clear();
};
