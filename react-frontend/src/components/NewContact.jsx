import React, { useState } from 'react';
import "./Sidebar.css";
import { addContact } from '../services/chat';

function NewContact({ onClose }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) {
            setError("Please enter an email!");
            return;
        }
        addContact(email);
    }
    return (
        <>
            <div className="add-contact-form">
                <input id="add-contact-input" type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} value={email}/>
                <p>{error}</p>
                <button type="submit" id="add-contact-submit-btn" onClick={handleSubmit}>Add</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </>
    );
}

export default NewContact;