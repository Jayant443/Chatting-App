import Message from "./Message";
import emojiImg from "../assets/emoji-icon-image.png";
import { useState, useRef, useEffect } from "react";

function ChatWindow({ currentUserId, messages, onSendMsg }) {
    const [inputMsg, setInputMsg] = useState("");
    const messagesEndRef = useRef(null);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView();
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function handleSendMsg() {
        if (inputMsg.trim()) {
            onSendMsg(inputMsg);
            setInputMsg("");
        }
    }

    function handleKeyPress(e) {
        if (e.key==='Enter') {
            handleSendMsg();
        }
    }

    return (
        <>
            <div className="messages" id="messages">
                {
                    messages.map((message) => (<Message key={message.id} message={message} isSent={message.sender_id === currentUserId} />))
                }
            <div ref={messagesEndRef} />
            </div>
            <div className="chat-input" id="chat-input">
                <button className="emoji"><img src={emojiImg} /></button>
                <input id="message-input" type="text" placeholder="Type a message" onChange={(e) => {setInputMsg(e.target.value)}} onKeyPress={handleKeyPress} value={inputMsg}/>
                <button className="send-btn" onClick={handleSendMsg} >Send</button>
            </div>
        </>
    );
}

export default ChatWindow;