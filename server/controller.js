const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const { generateToken } = require("./crypto/jwt");
const sha256 = require("./crypto/SHA256");

exports.ping = (req, res) => {
    return res.status(200).json({ message: "pong" });
};

exports.signup = async (req, res) => {
    try {
        // const existUser = await User.find({
        //     username: req.body.username,
        // });

        // if (existUser) {
        //     return res.status(401).json({ message: "user existed" });
        // }

        const hashPassword = sha256.hash(req.body.password);

        const newUser = new User({
            username: req.body.username,
            password: hashPassword,
            public_key: req.body.public_key,
        });

        const savedUser = await newUser.save();
        return res.status(200).json(savedUser);
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const checkUser = User.find({
            username: username,
        });
        if (!checkUser) {
            return res.status(401).json({ message: "user not found" });
        }

        if (sha256.hash(password) !== checkUser.password) {
            return res.status(401).json({ message: "wrong password" });
        }

        const accessToken = await generateToken(
            username,
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_LIFE
        );

        return res.json({
            accessToken,
            user: User,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createNewConversation = async (req, res) => {
    const existConversations = await Conversation.find({
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

    const newConversation = new Conversation({
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
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.query.conversationId,
        });
        const receiver = await User.find({
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
