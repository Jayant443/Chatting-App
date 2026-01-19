import React, { useState } from 'react';
import "./Sidebar.css";
import   NewContact from "./NewContact";

function Sidebar({ contacts, onSelectChat }) {
    const [showNewContactForm, setShowNewContactForm] = useState(false);
    return (
        <>
            <aside className="sidebar">
                <header className="sidebar-header">Chats</header>
                {showNewContactForm && (
                    <NewContact onClose={() => setShowNewContactForm(false)} />
                )}
                <ul className="chat-list" id="chat-list">
                {contacts.map((contact) => (<li key={contact.id} className="chat-item">
                    <img className="avatar" src="/assets/default-profile-icon.jpg" />
                    <div className="chat-info" onClick={() => onSelectChat(contact)}>
                        <span className="chat-name">{contact.contact.username}</span>
                        <span className="recent-msg">Click to contact</span>
                    </div>
                </li>
                ))}
                <button id='new-contact-btn' onClick={() => setShowNewContactForm(true)}>+</button>
            </ul>
            </aside>
        </>
    );
}

export default Sidebar;