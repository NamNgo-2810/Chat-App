import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
    ChatContainer,
    MainContainer,
    MessageInput,
    MessageList,
    Message,
    ConversationList,
    Conversation,
    Sidebar,
    Avatar,
    ConversationHeader,
    Search,
} from "@chatscope/chat-ui-kit-react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import Switch from "react-switch";
import {
    createNewConversation,
    getConversationOfUser,
    getMessages,
    getConversationKey,
    logout,
    sendMessage,
} from "./CommonCall";
import { AES, enc } from "crypto-js";

function Chat({ setIsLoggedIn }) {
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);

    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [message, setMessage] = useState("");
    const [newReceiver, setNewReceiver] = useState("");
    const [encryptedMode, setEncryptedMode] = useState(true);
    const socket = useRef(io("ws://localhost:8900"));
    const user = {
        user_id: localStorage.getItem("user_id"),
        username: localStorage.getItem("username"),
        avt_url: localStorage.getItem("avt_url"),
    };

    const defaultAvatar =
        "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg";

    const fetchConversations = async () => {
        try {
            const res = await getConversationOfUser(user.user_id);

            setConversations(res.data);
            setCurrentChat(res.data[0]);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMessages = async () => {
        try {
            // const res = await getPublicKey(currentChat._id, user.user_id);
            // localStorage.setItem("n_receiver", res.n);
            // localStorage.setItem("e_receiver", res.e);
            const res = await getConversationKey(
                currentChat._id,
                localStorage.getItem("RSA_n"),
                localStorage.getItem("RSA_e")
            );
            localStorage.setItem("conversation_key", res);
            const res1 = await getMessages(currentChat._id);
            setMessages(res1.messages);
        } catch (error) {
            // console.log(error);
        }
    };

    const onSendRaw = async (content) => {
        if (!content) {
            console.log("Empty");
            return;
        }

        const newMessage = {
            sender: user.username,
            senderId: user.user_id,
            contentType: "text",
            encrypted: false,
            content: content,
            conversationId: currentChat._id,
        };

        try {
            const res = await sendMessage(newMessage);
            setMessages([...messages, { ...res.data, content: content }]);
        } catch (error) {
            console.log(error);
            return;
        }

        const receiverId = currentChat.members.find(
            (member) => member.id != user.user_id
        ).id;

        socket.current.emit("sendMessage", {
            senderId: user.user_id,
            receiverId: receiverId,
            contentType: newMessage.contentType,
            content: content,
            encrypted: false,
        });

        setMessage("");
    };

    const onSend = async (content) => {
        if (!content) {
            console.log("Empty");
            return;
        }

        // const encryptedMessageForReceiver = RSA.encrypt(
        //     RSA.encode(content),
        //     bigInt(localStorage.getItem("n_receiver")),
        //     bigInt(localStorage.getItem("e_receiver"))
        // );

        // const encryptedMessageForSender = AES.encrypt(
        //     content,
        //     localStorage.getItem("d_sender")
        // ).toString();

        const encryptedMessage = AES.encrypt(
            content,
            localStorage.getItem("conversation_key")
        ).toString();

        const newMessage = {
            sender: user.username,
            senderId: user.user_id,
            contentType: "text",
            encrypted: true,
            // content: encryptedMessageForReceiver,
            // content: `${encryptedMessageForSender}${encryptedMessageForReceiver}`,
            content: encryptedMessage,
            conversationId: currentChat._id,
        };

        try {
            const res = await sendMessage(newMessage);
            setMessages([...messages, { ...res.data, content: content }]);
        } catch (error) {
            console.log(error);
            return;
        }

        const receiverId = currentChat.members.find(
            (member) => member.id != user.user_id
        ).id;

        socket.current.emit("sendMessage", {
            senderId: user.user_id,
            receiverId: receiverId,
            contentType: newMessage.contentType,
            // content: encryptedMessageForReceiver,
            content: encryptedMessage,
            encrypted: true,
        });

        setMessage("");
    };

    const onSearch = async () => {
        const res = await createNewConversation(
            user.user_id,
            user.username,
            user.avt_url,
            newReceiver,
            localStorage.getItem("RSA_n"),
            localStorage.getItem("RSA_e")
        );
        if (res.status == 400) {
            alert("this user is not existed");
            return;
        } else if (res.status != 200) {
            alert("something wrong");
            return;
        }

        setConversations((prev) => [...prev, res.data]);
        setCurrentChat(res.data);
        setNewReceiver("");
    };

    useEffect(() => {
        socket.current = io("ws://localhost:8900");
        socket.current.on("getMessage", (data) => {
            console.log("Message arrival", data);
            setArrivalMessage({
                senderId: data.senderId,
                contentType: data.contentType,
                // content: data.encrypted
                //     ? RSA.decode(
                //           RSA.decrypt(
                //               data.content,
                //               bigInt(localStorage.getItem("d_sender")),
                //               bigInt(localStorage.getItem("n_sender"))
                //           )
                //       )
                //     : data.content,
                content: data.encrypted
                    ? AES.decrypt(
                          data.content,
                          localStorage.getItem("conversation_key")
                      ).toString(enc.Utf8)
                    : data.content,
                createdAt: Date.now(),
            });
        });
    }, []);

    useEffect(() => {
        socket.current.emit("addUser", user.user_id);
        // socket.current.on("getUsers", (users) => {
        //     console.log(users);
        // });
    }, [user]);

    useEffect(() => {
        setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage]);

    useEffect(() => {
        if (conversations) {
            fetchConversations();
        }
        return () => {
            console.log("Unmount");
        };
    }, [user.user_id]);

    useEffect(() => {
        if (currentChat) {
            fetchMessages();
        }

        return () => {
            console.log("Unmount");
        };
    }, [currentChat]);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "15px",
                    marginBottom: "10px",
                    padding: "5px",
                }}
            >
                <div style={{ display: "flex" }}>
                    <Avatar
                        status="available"
                        src={user.avt_url || defaultAvatar}
                        size="lg"
                    />
                    <h3 style={{ marginLeft: "10px" }}>{user.username}</h3>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <label>Encrypt message</label>
                    <br />
                    <Switch
                        checked={encryptedMode}
                        onChange={() => {
                            setEncryptedMode(!encryptedMode);
                        }}
                    />
                </div>
            </div>
            <div style={{ height: "510px" }}>
                <MainContainer>
                    <Sidebar position="left" scrollable={false}>
                        <Search
                            placeholder="Search..."
                            onChange={(value) => setNewReceiver(value)}
                            value={newReceiver}
                            onKeyUp={(e) => {
                                if (
                                    e.key == "Enter" &&
                                    newReceiver.length > 0
                                ) {
                                    // console.log(newReceiver);
                                    onSearch();
                                }
                            }}
                        />
                        <ConversationList>
                            {conversations?.map((conversation, index) => {
                                return (
                                    <Conversation
                                        onClick={() => {
                                            setCurrentChat(conversation);
                                        }}
                                        key={`${index}`}
                                        active={
                                            conversation._id === currentChat._id
                                        }
                                    >
                                        <Avatar
                                            status="available"
                                            src={
                                                conversation.members.find(
                                                    (member) =>
                                                        member.id !==
                                                        user.user_id
                                                ).avt_url || defaultAvatar
                                            }
                                        />
                                        <Conversation.Content
                                            style={{ textAlign: "start" }}
                                            name={
                                                conversation.members.find(
                                                    (member) =>
                                                        member.id !==
                                                        user.user_id
                                                ).user
                                            }
                                            // lastSenderName={
                                            //     messages?.[messages?.length - 1]
                                            //         .sender
                                            // }
                                            // info={
                                            //     messages?.[messages.length - 1]
                                            //         .content
                                            // }
                                        />
                                    </Conversation>
                                );
                            })}
                        </ConversationList>
                    </Sidebar>

                    <ChatContainer>
                        {() => {
                            if (currentChat) {
                                return (
                                    <ConversationHeader>
                                        <ConversationHeader.Back />
                                        <Avatar
                                            src={
                                                currentChat.members.find(
                                                    (member) =>
                                                        member.id !==
                                                        user.user_id
                                                ).avt_url || defaultAvatar
                                            }
                                        />
                                        <ConversationHeader.Content
                                            userName={
                                                currentChat.members.find(
                                                    (member) =>
                                                        member.id !==
                                                        user.user_id
                                                ).user
                                            }
                                            info="Active"
                                        />
                                    </ConversationHeader>
                                );
                            }
                        }}
                        {currentChat && (
                            <MessageList>
                                {messages?.map((message, index) => {
                                    return (
                                        <Message
                                            model={{
                                                direction:
                                                    message?.senderId ==
                                                    user.user_id
                                                        ? "outgoing"
                                                        : "incoming",
                                            }}
                                            key={`${index}`}
                                            avatarSpacer
                                        >
                                            <Avatar
                                                src={
                                                    currentChat?.members.find(
                                                        (member) =>
                                                            message?.senderId ==
                                                            member.id
                                                    )?.avt_url || defaultAvatar
                                                }
                                            />

                                            <Message.TextContent
                                                text={message?.content}
                                            />
                                        </Message>
                                    );
                                })}
                            </MessageList>
                        )}
                        <MessageInput
                            placeholder="Aa"
                            onSend={encryptedMode ? onSend : onSendRaw}
                            value={message}
                            onChange={(e) => {
                                setMessage(e);
                            }}
                            style={{ textAlign: "start" }}
                            sendDisabled={false}
                            disabled={currentChat == null}
                        />
                    </ChatContainer>
                </MainContainer>
                <br />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <button
                        style={{
                            width: "300px",
                            backgroundColor: "#4caf50",
                            padding: "14px 20px",
                            margin: "auto",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            logout();
                            setConversations(null);
                            setCurrentChat(null);
                            setIsLoggedIn(false);
                        }}
                    >
                        <p
                            style={{
                                color: "white",
                                margin: "0",
                                padding: "0",
                            }}
                        >
                            Logout
                        </p>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Chat;
