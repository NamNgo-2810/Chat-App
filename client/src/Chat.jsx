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
import RSA from "./RSA";
import {
    getConversationOfUser,
    getMessages,
    getPublicKey,
    logout,
    sendMessage,
} from "./CommonCall";
import bigInt from "big-integer";

function Chat() {
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);

    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [message, setMessage] = useState("");
    const [publicKey, setPublicKey] = useState();
    const socket = useRef(io("ws://localhost:8900"));
    const user = {
        user_id: localStorage.getItem("user_id"),
        username: localStorage.getItem("username"),
    };

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
            const res = await getPublicKey(currentChat._id, user.user_id);
            setPublicKey({ n: bigInt(res.n), e: bigInt(res.e) });
            const res1 = await getMessages(currentChat._id, publicKey);
            setMessages(res1.messages);
        } catch (error) {
            console.log(error);
        }
    };

    const onSend = async (content) => {
        if (!content) {
            console.log("Empty");
            return;
        }

        const encryptedMessage = RSA.encrypt(
            RSA.encode(content),
            publicKey.n,
            publicKey.e
        );

        const newMessage = {
            sender: user.username,
            senderId: user.user_id,
            contentType: "text",
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
            content: newMessage.content,
        });

        setMessage("");
    };

    useEffect(() => {
        socket.current = io("ws://localhost:8900");
        socket.current.on("getMessage", (data) => {
            setArrivalMessage({
                senderId: data.senderId,
                contentType: data.contentType,
                content: RSA.decode(
                    RSA.decrypt(
                        data.content,
                        process.env.SECRET_KEY,
                        publicKey.n
                    )
                ),
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
        fetchConversations();
    }, [user.user_id]);

    useEffect(() => {
        if (currentChat) {
            fetchMessages();
        }
    }, [currentChat]);

    return (
        <div style={{ marginTop: "80px", height: "450px" }}>
            <button onClick={logout}>Logout</button>
            <MainContainer>
                <Sidebar position="left" scrollable={false}>
                    <Search placeholder="Search..." />
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
                                                    member.id !== user.user_id
                                            ).avtUrl
                                        }
                                    />
                                    <Conversation.Content
                                        style={{ textAlign: "start" }}
                                        name={
                                            conversation.members.find(
                                                (member) =>
                                                    member.id !== user.user_id
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
                                                    member.id !== user.user_id
                                            ).avtUrl
                                        }
                                    />
                                    <ConversationHeader.Content
                                        userName={
                                            currentChat.members.find(
                                                (member) =>
                                                    member.id !== user.user_id
                                            ).user
                                        }
                                        info="Active"
                                    />
                                </ConversationHeader>
                            );
                        }
                    }}

                    <MessageList>
                        {messages?.map((message, index) => {
                            return (
                                <Message
                                    model={{
                                        direction:
                                            message?.senderId == user.user_id
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
                                            )?.avtUrl
                                        }
                                    />

                                    <Message.TextContent
                                        text={message?.content}
                                    />
                                </Message>
                            );
                        })}
                    </MessageList>
                    <MessageInput
                        placeholder="Aa"
                        onSend={onSend}
                        value={message}
                        onChange={(e) => {
                            setMessage(e);
                        }}
                        style={{ textAlign: "start" }}
                        sendDisabled={false}
                    />
                </ChatContainer>
            </MainContainer>
            <button
                type="submit"
                title="Logout"
                onClick={() => {
                    localStorage.clear();
                }}
            />
        </div>
    );
}

export default Chat;
