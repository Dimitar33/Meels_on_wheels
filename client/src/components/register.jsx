import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Footer from "./footer.jsx";

const API = "http://localhost:5000";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    const res = await axios.post(`${API}/register`, { email, password })
    navigate("/")
  }

  return (
    <>
      <header className="bg-dark py-5">
        <div className="container px-4 px-lg-5 my-5">
          <div className="text-center text-white">
            <h1 className="display-4 fw-bolder">MEALS ON WHEELS</h1>
            <h1 className="display-4 fw-bolder">The best meals you can find!</h1>
            <p className="lead fw-normal text-white-50 mb-0">
              Healthy and tasty.
            </p>
          </div>
        </div>
      </header>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md w-80">
          <h2 className="text-xl mb-4">Register</h2>
<div className="card-footer">
            <div className="d-flex justify-content-center links">
              Already have an account?<a className="register" style={{color: "blue"}} href="/">Login</a>
            </div>
          </div>
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
            onClick={register}
            className="bg-blue-500 text-white w-full p-2 rounded"
          >
            Register
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}