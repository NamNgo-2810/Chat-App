import axios from "axios";
import { xorDecrypt, xorEncrypt } from "./XOR";
// import * as fs from "fs";
// import * as os from "os";
const RSA = require("../src/RSA");

const API_URI = "http://localhost:8080/api/";

export const register = async (username, password) => {
    const key = RSA.generate(250);
    const public_key = { e: key.e, n: key.n };
    const encrypted_private_key = xorEncrypt(key.d, password);

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
        const rawPrivateKey = xorDecrypt(res.data.private_key, password);
        console.log("private key", rawPrivateKey);
        localStorage.setItem("private_key", rawPrivateKey);
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

export const getMessages = async (conversation_id, public_key) => {
    const res = await axios.get(
        API_URI + `/message?conversationId=${conversation_id}`,
        { headers: { x_authorization: localStorage.getItem("access_token") } }
    );
    if (res.status == 200) {
        const SECRET_KEY = localStorage.getItem("private_key");
        res.data.messages.map((message) => {
            return {
                ...message,
                content: RSA.decode(
                    RSA.decrypt(message.content, SECRET_KEY, public_key?.n)
                ),
            };
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
