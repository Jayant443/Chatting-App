import { chatRoute, userRoute } from "./routes";
import axios from "axios";


const getConfig = () => {
    const token = localStorage.getItem("token");
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    return config;
}

export const getContacts = async() => {
    const response = await axios.get(`${chatRoute}/contacts`, getConfig());
    return response.data;
}

export const getMessages = async(chatId) => {
    const response = await axios.get(`${chatRoute}/${chatId}/messages`, getConfig());
    return response.data;
}

export const getCurrentUser = async() => {
    const response = await axios.get(`${userRoute}/users/me`, getConfig());
    return response.data;
}

export const createGrp = async(grpName, userId) => {
    const response = await axios.post(`${chatRoute}/group/create`, {name: grpName, type: "group", admin_id:userId}, getConfig());
    return response.data;
}

export const addMember = async(memberId, chatId) => {
    const response = await axios.post(`${chatRoute}/${chatId}/member`, {user_id: memberId}, getConfig());
    return response.data;
}

export const addContact = async(email) => {
    const response = await axios.post(`${chatRoute}/contact/add`, {email: email}, getConfig());
    return response.data;
}

export const getWebSocketUrl = (chatId) => {
    const token = localStorage.getItem("token");
    return `ws://127.0.0.1:8000/chats/ws/${chatId}?token=${token}`;
};