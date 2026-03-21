import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import React from "react";

import Login from "./components/login";
import Register from "./components/register";
import Notes from "./components/notes";

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login setToken={setToken} />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/notes" element={token ? (<Notes token={token} setToken={setToken} />) : (<Navigate to="/" replace />)} />

      </Routes>
    </BrowserRouter>
  );
}