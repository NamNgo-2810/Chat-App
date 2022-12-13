const RSA = require("./crypto/RSA");
const user = require("./models/user");
const conversation = require("./models/conversation");
const message = require("./models/message");
const { generateToken } = require("./crypto");
const { hash } = require("./crypto/SHA256");

exports.signup = async (req, res) => {
    const existUser = await conversation.find({
        username: req.body.username,
    });

    if (existUser) {
        return res.status(401).json({ message: "user existed" });
    }

    const newUser = new user({
        username: req.body.username,
        password: hash(req.body.password),
        public_key: req.body.public_key,
    });

    try {
        const savedUser = await newUser.save();
        return res.status(200).json(savedUser);
    } catch (error) {
        console.log("error", error);
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const checkUser = user.find({
            username: username,
        });
        if (!checkUser) {
            return res.status(401).json({ message: "user not found" });
        }

        if (hash(password) !== checkUser.password) {
            return res.status(401).json({ message: "wrong password" });
        }

        const accessToken = await generateToken(
            username,
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_LIFE
        );

        return res.json({
            accessToken,
            user,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createNewConversation = async (req, res) => {
    const existConversations = await conversation.find({
        id: req.body.id_1,
    });

    const exist = existConversations.find(
        (conversation) =>
            (conversation.members[0].id == req.body.id_1 &&
                conversation.members[1].id == req.body.id_2) ||
            (conversation.members[0].id == req.body.id_2 &&
                conversation.members[1].id == req.body.id_1)
    );

    if (exist) {
        return res.status(200).json(exist);
    }

    // const key1 = RSA.generate(250)
    // const keys1 = {public: {e: key1.e, n: key1.n}, private: key1.d}

    // const key2 = RSA.generate(250)
    // const keys2 = {public: {e: key2.e, n: key2.n}, private: key2.d}

    const newConversation = new conversation({
        members: [
            {
                id: req.body.id_1,
                user: req.body.user_1,
                avtUrl: req.body.avt_1,
            },
            {
                id: req.body.id_2,
                user: req.body.user_2,
                avtUrl: req.body.avt_2,
            },
        ],
    });

    try {
        const savedConversation = await newConversation.save();
        return res.status(200).json(savedConversation);
    } catch (error) {
        return res.status(500).send(error);
    }
};

exports.getConversationOfUser = async (req, res) => {
    try {
        const conversation = await conversation.find({
            id: req.query.userId,
        });
        return res.status(200).json(conversation);
    } catch (error) {
        return res.status(500).send(error);
    }
};

exports.sendMessage = async (req, res) => {
    const newMessage = new message(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await message.find({
            conversationId: req.query.conversationId,
        });
        const receiver = await user.find({
            id: req.body.receiver_id,
        });

        res.status(200).json({
            messages: messages,
            public_key: receiver.public_key,
        });
    } catch (error) {
        res.status(500).send(error);
    }
};
