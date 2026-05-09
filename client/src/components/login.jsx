import { useNavigate } from "react-router-dom";
import React from "react";
import { useState } from "react";
import axios from "axios";
import Footer from "./footer.jsx";

const API = "http://localhost:5000";

export default function Login({ setToken, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await axios.post(`${API}/login`, { email, password }, { withCredentials: true });
    setToken(res.data.accessToken);
    setUser(res.data.user)
    localStorage.setItem("token", res.data.accessToken)
    navigate("/menu");
  };

  return (
    <>
      <header className="bg-dark py-5">
        <div className="container px-4 px-lg-5 my-5">
          <div className="text-center text-white">
            <h1 className="display-4 fw-bolder">Welcome to MEALS ON WHEELS</h1>
            <h1 className="display-4 fw-bolder">The best meals you can find!</h1>
            <p className="lead fw-normal text-white-50 mb-0">
              Healthy and tasty.
            </p>
          </div>
        </div>
      </header>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md w-80">
          <h2 className="text-xl mb-4">Login</h2>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="border p-2 w-full mb-2"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="bg-blue-500 text-white w-full p-2 rounded"
          >
            Login
          </button>
          <div className="card-footer">
            <div className="d-flex justify-content-center links">
              Don't have an account?<a className="register" style={{color: "blue"}} href="register">Sign Up</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}