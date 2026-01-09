import React, { useState, useEffect } from 'react';
import { getUserContactsRoute } from '../api/routes';
import "./Sidebar.css";
import axios from "axios";
import "../assets/default-profile-icon.jpg";

function ContactList() {
    const [chats, setChats] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await axios.get(getUserContactsRoute);
                setChats(res.data);
            }
            catch (err) {
                setError(`Failed to load contacts: ${err}`);
            }
        }
        fetchChats();
    }, []);
    if (error) return <><div>Error</div></>
    return (
        <>
            <ul className="chat-list" id="chat-list">
                {chats.map((chat) => (<li key={chat.id} className="chat-item">
                    <img className="avatar" src="assets/default-profile-icon.jpg" />
                    <div className="chat-info">
                        <span className="chat-name">{chat.name}</span>
                        <span className="recent-msg">Click to chat</span>
                    </div>
                </li>
                ))};
            </ul>
        </>
    );
}

export default ContactList;