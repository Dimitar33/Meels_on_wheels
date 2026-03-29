import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function Notes({ token }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [dark, setDark] = useState(false);

    const fetchNotes = async () => {
    const res = await axios.get(`${API}/notes`, { headers: { Authorization: token } });
    setNotes(res.data);
  };

  const addNote = async () => {
    await axios.post(`${API}/notes`, { text }, { headers: { Authorization: token } });
    setText("");
    fetchNotes();
  };

  useEffect(() => { if (token) fetchNotes(); }, [token]);

  

  return (
    <div className={dark ? "dark bg-gray-900 min-h-screen p-6" : "bg-gray-100 min-h-screen p-6"}>
      <div className="max-w-xl mx-auto">

        <button
          onClick={() => setDark(!dark)}
          className="mb-4 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded"
        >
          Toggle Theme
        </button>

        <h1 className="text-2xl mb-4 dark:text-white">My Notes</h1>

        <div className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Write a note"
          />

          <button
            onClick={addNote}
            className="bg-green-500 text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        {notes.map(note => (
          <div
            key={note._id}
            className="bg-white dark:bg-gray-800 dark:text-white p-3 rounded shadow mb-2"
          >
            {note.text}
          </div>
        ))}
      </div>
    </div>
  );
}