import React, { useState } from 'react';
import axios from 'axios';
import "./Sidebar.css";
import { addContactRoute } from '../api/routes';

function NewContact() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) setError("Please enter an email!");
        const res = await axios.post(
            addContactRoute,
            {email: email}
        );
        if (res.ok) {
            const data = res.json();
            alert(`${data.name} is now a contact!`);
        }
        else {
            setError("Failed to add contact");
        }
    }
    return (
        <>
            <div class="add-contact-form">
                <input id="add-contact-input" type="text" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} value={email}/>
                <p>{error}</p>
                <button type="submit" id="add-contact-submit-btn" onClick={handleSubmit}>Add</button>
            </div>
        </>
    );
}

export default NewContact;