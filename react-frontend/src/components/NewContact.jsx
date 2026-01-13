import React, { useState } from 'react';
import axios from 'axios';
import "./Sidebar.css";
import { addContactRoute } from '../api/routes';

function NewContact() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) {
            setError("Please enter an email!");
            return;
        }
        try {
            const res = await axios.post(
            addContactRoute,
            {email: email}
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
            </div>
        </>
    );
}

export default NewContact;