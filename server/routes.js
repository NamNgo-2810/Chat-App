const express = require("express");
const router = express.Router();
const controller = require("./controller");
const middleware = require("./middleware");

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/conversation/create", controller.createNewConversation);
router.get("/conversation/", controller.getConversationOfUser);
router.post("/message/send", middleware.isAuth, controller.sendMessage);
router.get("/message/", middleware.isAuth, controller.getMessages);

module.exports = router;
