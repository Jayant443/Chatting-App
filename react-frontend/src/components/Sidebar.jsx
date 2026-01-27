import "./Sidebar.css";
import   NewContact from "./NewContact";
import defaultAvatar from "../assets/default-profile-icon.jpg";

function Sidebar({ contacts, onSelectChat }) {
    return (
        <>
            <aside className="sidebar">
                <header className="sidebar-header">Chats</header>
                
                <ul className="chat-list" id="chat-list">
                {contacts.map((contact) => (<li key={contact.id} className="chat-item">
                    <img className="avatar" src={defaultAvatar} />
                    <div className="chat-info" onClick={() => onSelectChat(contact)}>
                        <span className="chat-name">{contact.type==="personal" ? contact?.contact?.username : contact.name}</span>
                        <span className="recent-msg">Click to contact</span>
                    </div>
                </li>
                ))}
            </ul>
            </aside>
        </>
    );
}

export default Sidebar;