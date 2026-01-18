import { chatRoute } from "./routes";
import axios from "axios";


const token = localStorage.getItem("token");
const config = {
    headers: {
        Authorization: `Bearer ${token}`
    }
};

export const getContacts = async() => {
    const response = await axios.get(`${chatRoute}/contacts`, config);
    return response.data;
}

export const getMessages = async(chatId) => {
    const response = await axios.get(`${chatRoute}/${chatId}/messages`, config);
    return response.data;
}