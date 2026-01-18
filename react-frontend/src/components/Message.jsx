function Message({ message, isSent }) {
    function formatTime(time) {
        const date = new Date(time);
        return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    }
    return (
        <>
            <div className={`message ${isSent ? "sent": "received"}`}>
                {!isSent && message.sender && (<span className="sender">{message.sender}</span>)}
                <div className="details">
                    <span className="text">{message.content}</span>
                    <span className="time">{formatTime(message.created_at)}</span>
                </div>
            </div>
        </>
    )
}

export default Message;