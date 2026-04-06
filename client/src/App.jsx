import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import React from "react";
import "./css/styles.css"

import Login from "./components/login";
import Register from "./components/register";
import Notes from "./components/notes";
import Menu from "./components/menu";
import Meals from "./components/meals";
import Navbar from "./components/navbar";
import Bag from "./components/bag";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [bag, setBag] = useState([])

  // router built with the help of AI
  return (


    <BrowserRouter>

      {token && <Navbar setToken={setToken} bagCount={bag.length} />}

      <Routes>

        <Route path="/" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={token ? (<Menu token={token} bag={bag} setBag={setBag} setToken={setToken} />) : (<Navigate to="/" replace />)} />
        <Route path="/bag" element={token ? (<Bag token={token} bag={bag} setBag={setBag} setToken={setToken} />) : (<Navigate to="/" replace />)} />
        <Route path="/meals" element={token ? (<Meals token={token} setToken={setToken} />) : (<Navigate to="/" replace />)} />
        <Route path="/notes" element={token ? (<Notes token={token} setToken={setToken} />) : (<Navigate to="/" replace />)} />

      </Routes>
    </BrowserRouter>
  );
}