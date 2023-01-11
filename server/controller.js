const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const { initializeApp } = require("firebase/app");
const { getDatabase, onValue, ref, set } = require("firebase/database");
const { generateToken } = require("./crypto/jwt");
const sha256 = require("./crypto/SHA256");
const RSA = require("./crypto/RSA");
const bigInt = require("big-integer");

const Avatars = [
    "https://chatscope.io/storybook/react/static/media/zoe.e31a4ff8.svg",
    "https://chatscope.io/storybook/react/static/media/lilly.62d4acff.svg",
    "https://chatscope.io/storybook/react/static/media/joe.641da105.svg",
    "https://chatscope.io/storybook/react/static/media/emily.d34aecd9.svg",
    "https://chatscope.io/storybook/react/static/media/kai.b62f69dc.svg",
    "https://chatscope.io/storybook/react/static/media/akane.b135c3e3.svg",
    "https://chatscope.io/storybook/react/static/media/eliot.d7038eac.svg",
    "https://chatscope.io/storybook/react/static/media/patrik.d89db575.svg",
];

const db = getDatabase(
    initializeApp({
        databaseURL:
            process.env.PKI_URI ||
            "https://cartoongan-namngo2810-default-rtdb.asia-southeast1.firebasedatabase.app/",
    })
);
const writeToPKI = async (ID, payload) => set(ref(db, "keys/" + ID), payload);
const readFromPKI = async (ID) => {
    let data;

    return new Promise((resolve, reject) => {
        onValue(ref(db, "keys/" + ID), (snapshot) => {
            data = snapshot.val();
            resolve(data);
        });
    }).then((data) => data);
};

exports.ping = (req, res) => {
    return res.status(200).json({ message: "pong" });
};

exports.testRead = async (req, res) => {
    const result = await readFromPKI("63bd853d20f18875fbd597f5");
    return res.status(200).send(result);
};

exports.signup = async (req, res) => {
    try {
        const existUser = await User.find({
            username: req.body.username,
        });

        if (existUser.length > 0) {
            return res.status(401).json({ message: "user existed" });
        }

        const hashPassword = sha256.hash(req.body.password);

        const newUser = new User({
            username: req.body.username,
            password: hashPassword,
            // public_key: req.body.public_key,
            // private_key: req.body.private_key,
            avt_url: Avatars[Math.floor(Math.random() * Avatars.length)],
        });

        await newUser.save();

        // Generate a new RSA pair of keys and save to KMS, indedxed by user's id

        const RSAKey = RSA.generate(250);

        writeToPKI(newUser._id.toString(), {
            n: RSAKey.n.toString(),
            d: RSAKey.d.toString(),
            e: RSAKey.e.toString(),
        });

        return res.status(200).json({ message: "register success" });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const checkUser = await User.find({
            username: username,
        });
        if (checkUser.length != 1) {
            return res.status(401).json({ message: "user not found" });
        }

        const tmp = sha256.hash(password);

        if (tmp !== checkUser[0].password) {
            return res.status(401).json({ message: "wrong password" });
        }

        const accessToken = await generateToken(
            username,
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_LIFE
        );

        // get user's RSA key from KMS

        const { n, d, e } = await readFromPKI(checkUser[0]._id.toString());

        return res.status(200).json({
            access_token: accessToken,
            username: checkUser[0].username,
            user_id: checkUser[0]._id,
            avt_url: checkUser[0].avt_url || null,
            RSA: {
                n: n,
                d: d,
                e: e,
            },
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createNewConversation = async (req, res) => {
    const { user_id, username, avt_url, receiver_username } = req.body;
    const existConversations = await Conversation.find({
        "members.id": { $in: [user_id] },
    });

    const exist = existConversations.find(
        (conversation) =>
            (conversation.members[0].id == user_id &&
                conversation.members[1].username == receiver_username) ||
            (conversation.members[0].username == receiver_username &&
                conversation.members[1].id == user_id)
    );

    if (exist) {
        return res.status(200).json(exist);
    }

    const receiver = await User.findOne({
        username: receiver_username,
    });

    if (!receiver) {
        return res.status(400).json({ message: "this user is not existed" });
    }

    const newConversation = new Conversation({
        members: [
            {
                id: user_id,
                username: username,
                avt_url: avt_url,
            },
            {
                id: receiver._id.toString(),
                username: receiver_username,
                avt_url: receiver.avt_url,
            },
        ],
    });

    try {
        const secretKey = sha256.hash(`${user_id}${receiver._id.toString()}`);
        const savedConversation = await newConversation.save();

        // save secretKey to KMS, indexed by conversation's id

        await writeToPKI(savedConversation._id.toString(), secretKey);

        return res.status(200).json({
            ...savedConversation,
            encryptedKey: RSA.encrypt(
                RSA.encode(secretKey),
                bigInt(req.body.n),
                bigInt(req.body.e)
            ),
        });
    } catch (error) {
        return res.status(500).send(error);
    }
};

exports.getConversationOfUser = async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $elemMatch: { id: req.query.userId } },
        });

        return res.status(200).json(conversation);
    } catch (error) {
        return res.status(500).send(error);
    }
};

exports.sendMessage = async (req, res) => {
    const newMessage = new Message(req.body);
    console.log("message", newMessage);
    try {
        const savedMessage = await newMessage.save();
        return res.status(200).json(savedMessage);
    } catch (error) {
        return res.status(500).send(error);
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.query.conversationId,
        });

        res.status(200).json({
            messages: messages,
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getPublicKey = async (req, res) => {
    try {
        const conversation = await Conversation.findById(
            req.query.conversationId
        );

        const receiver = conversation.members.filter(
            (member) => member.id != req.query.senderId
        );

        const receiver1 = await User.findById(receiver[0].id);

        return res.status(200).send(receiver1.public_key);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getConversationKey = async (req, res) => {
    try {
        const { conversationId, n, e } = req.query;
        // console.log(req.query);
        // use conversationId to fetch its key and encrypted the key before send to client
        const conversationKey = await readFromPKI(conversationId.toString());
        // console.log("raw key", conversationId);
        const encryptedConversationKey = RSA.encrypt(
            RSA.encode(conversationKey),
            bigInt(n),
            bigInt(e)
        );

        return res.status(200).send(conversationKey);
    } catch (error) {
        res.status(500).send(error);
    }
};
