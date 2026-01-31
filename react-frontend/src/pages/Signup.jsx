import React, { useState } from "react";
import axios from "axios";
import { signupRoute } from "../services/routes";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.username || !formData.email || !formData.password) {
            alert("Please fill all the fields!");
            return;
        }
        // eslint-disable-next-line no-unused-vars
        const res = await axios.post(
            signupRoute,
            {
                username: formData.username,
                email: formData.email,
                password: formData.password
            }
        );
        alert("SignUp successful");
        navigate("/login", { replace: true });
    }

    return (
        <>
            <div className="form-box">
                <form className="form" id="signup-form" onSubmit={handleSubmit}>
                    <span className="title">Sign up</span>
                    <span className="subtitle">Create an account with your email.</span>
                    <div className="form-container">
                        <input type="text" className="input" id="username" name="username" value={formData.username} placeholder="Username" onChange={handleChange}/>
                        <input type="email" className="input" id="email" name="email" value={formData.email} placeholder="Email" onChange={handleChange}/>
                        <input type="password" className="input" id="password" name="password" value={formData.password} placeholder="Password" onChange={handleChange}/>
                    </div>
                    <button type="submit">Sign up</button>
                </form>
                <div className="form-section">
                    <p>Already have an account? <a href="/login">Log in</a> </p>
                </div>
            </div>
        </>
    );
}

export default Signup;