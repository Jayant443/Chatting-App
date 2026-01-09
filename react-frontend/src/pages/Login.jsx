import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRoute } from "../api/routes";
import axios from "axios";
import "./login.css";

function Login() {
    const navigate = useNavigate("index.html");
    const [formData, setFormData] = useState(
        {
            username: "",
            password: ""
        }
    );

    function handleChange(e) {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            alert("Please fill all the fields!");
        }

        const res = await axios.post(
            loginRoute,
            {
                username: formData.username,
                password: formData.password
            }
        );
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.access_token);
            navigate("index.html");
        }
        else {
            alert("Login Failed! Please check the password.");
        }
    }

    return (
        <>
            <div className="form-box">
                <form className="form" id="signup-form">
                    <span className="title">Sign up</span>
                    <span className="subtitle">Create an account with your email.</span>
                    <div className="form-container">
                        <input type="text" className="input" id="username" value={formData.username} placeholder="Username" onChange={handleChange}/>
                        <input type="email" className="input" id="email" value={formData.email} placeholder="Email" onChange={handleChange}/>
                        <input type="password" className="input" id="password" value={formData.password} placeholder="Password" onChange={handleChange}/>
                    </div>
                    <button type="submit" onClick={handleSubmit}>Sign up</button>
                </form>
                <div className="form-section">
                    <p>Already have an account? <a href="login.html">Log in</a> </p>
                </div>
            </div>
        </>
    );
}

export default Login;