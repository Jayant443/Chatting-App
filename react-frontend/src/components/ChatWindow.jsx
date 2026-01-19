import Message from "./Message";

function ChatWindow({ currentUserId, messages }) {
    return (
        <>
            <div className="messages" id="messages">
                {
                    messages.map((message) => (<Message key={message.id} message={message} isSent={message.sender_id === currentUserId} />))
                }
            </div>
            <div className="chat-input" id="chat-input">
                <button className="emoji"><img src="/assets/emoji-icon-image.png" /></button>
                <input id="message-input" type="text" placeholder="Type a message" />
                <button className="send-btn">Send</button>
            </div>
        </>
    );
}

export default ChatWindow;