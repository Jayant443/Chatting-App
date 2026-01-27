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
        await addContact(email);
        setEmail("");
        onClose();
    }
    return (
        <>
            <div className='modal-backdrop'>
                <div className="add-contact-form">
                    <input id="add-contact-input" type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} value={email} />
                    <p className='error'>{error}</p>
                    <button type="submit" id="add-contact-submit-btn" onClick={handleSubmit}>Add</button>
                    <button id="close" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </>
    );
}

export default NewContact;