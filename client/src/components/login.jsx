import { useNavigate } from "react-router-dom";
import React from "react";
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await axios.post(`${API}/login`, { email, password }, { withCredentials: true });
    setToken(res.data.accessToken);
    navigate("/notes");
    console.log("TOKEN AFTER LOGIN:", res.data.accessToken);
  };

  return (
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
      </div>
    </div>
  );
}