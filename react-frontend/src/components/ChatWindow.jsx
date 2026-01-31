import Message from "./Message";
import emojiImg from "../assets/emoji-icon-image.png";
import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

function ChatWindow({ currentUserId, messages, onSendMsg }) {
    const [inputMsg, setInputMsg] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const messagesEndRef = useRef(null);

    const onEmojiClick = (emojiData) => {
        setInputMsg((prev) => prev + emojiData.emoji);
    }

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
            {showPicker && <div className="emoji-picker"><EmojiPicker onEmojiClick={onEmojiClick}/></div>}
                <button className="emoji" onClick={() => setShowPicker(!showPicker)}><img src={emojiImg} /></button>
                <input id="message-input" type="text" placeholder="Type a message" onChange={(e) => {setInputMsg(e.target.value)}} onKeyPress={handleKeyPress} value={inputMsg}/>
                <button className="send-btn" onClick={handleSendMsg} >Send</button>
            </div>
        </>
    );
}

export default ChatWindow;