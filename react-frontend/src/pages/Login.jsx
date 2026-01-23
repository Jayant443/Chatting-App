import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRoute } from "../services/routes";
import axios from "axios";
import "./login.css";

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(
        {
            username: "",
            password: ""
        }
    );

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            alert("Please fill all the fields!");
            return;
        }

        const form = new URLSearchParams();
        form.append("username", formData.username);
        form.append("password", formData.password);

        const { data } = await axios.post(
            loginRoute,
            form,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );


        localStorage.setItem("token", data.access_token);
        navigate("/chat", { replace: true });
    }

    return (
        <>
            <div className="form-box">
                <form className="form" id="signup-form" onSubmit={handleSubmit}>
                    <span className="title">Login</span>
                    <span className="subtitle">Welcome Back!</span>
                    <div className="form-container">
                        <input type="text" className="input" name="username" id="username" value={formData.username} placeholder="Username" onChange={handleChange} />
                        <input type="password" className="input" name="password" id="password" value={formData.password} placeholder="Password" onChange={handleChange} />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <div className="form-section">
                    <p>Don't have an account? <a href="/signup">SignUp</a> </p>
                </div>
            </div>
        </>
    );
}
