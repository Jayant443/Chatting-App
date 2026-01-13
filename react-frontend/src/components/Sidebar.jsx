import React, { useState } from 'react';
import "./Sidebar.css";
import { ContactList } from "./ContactList";
import { NewContact } from "./NewContact";

function Sidebar() {
    const [showNewContact, setShowNewContact] = useState(false);
    return (
        <>
            <aside class="sidebar">
                <header class="sidebar-header">Chats</header>
                <button onClick={() => setShowNewContact(true)}>+</button>
                {showNewContact && (
                    <NewContact onClose={() => setShowNewContact(false)} />
                )}
                <ContactList />
            </aside>
        </>
    );
}

export default Sidebar;