import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import React from "react";
import "./css/styles.css"

import Login from "./components/login";
import Register from "./components/register";
import Notes from "./components/notes";
import Menu from "./components/menu";

export default function App() {
  const [token, setToken] = useState(null);

  // router built with the help of AI
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login setToken={setToken} />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/menu" element={<Menu />}/>
        <Route path="/notes" element={token ? (<Notes token={token} setToken={setToken} />) : (<Navigate to="/" replace />)} />

      </Routes>
    </BrowserRouter>
  );
}