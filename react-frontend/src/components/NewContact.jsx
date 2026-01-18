import React, { useState } from 'react';
import axios from 'axios';
import "./Sidebar.css";
import { addContactRoute } from '../services/routes';

function NewContact({ onClose }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        };
        if (!email) {
            setError("Please enter an email!");
            return;
        }
        try {
            const res = await axios.post(
            addContactRoute,
            {email: email},
            config
        );
        const data = res.data;
        alert(`${data.name} is now a contact!`);
        }
        catch (err) {
            setError(err.response?.data?.message || "Failed to add contact");
        }
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