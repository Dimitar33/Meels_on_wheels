import React from "react";
import menu from "../lib/meals.jsx"
import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function Bag({ token, bag, setBag }) {

    const fetchBag = async () => {
        const res = await axios.get(`${API}/bag`, { headers: { Authorization: token } });
        setBag(res.data);
    }

    const removeFromBag = async (id) => {
        const res = axios.delete(`${API}/bag/${id}`, { headers: { Authorization: token } });
        fetchBag();
    }

    useEffect(() => { if (token) fetchBag(); }, [token])

    return (
        <>

            <section className="py-5">
                <div className="container px-4 px-lg-5 mt-5">
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">

                        {bag.map((m, key) => (
                            <div key={key} className="col mb-5">
                                <div className="card h-100">
                                    <img
                                        className="card-img-top"
                                        src={m.meal.image}
                                        alt={m.meal.name}
                                    />
                                    <div className="card-body p-4">
                                        <div className="text-center">
                                            <h5 className="fw-bolder">{m.meal.mealName}</h5>
                                            Count {m.quantity} <br />
                                            Price ${m.meal.price * m.quantity}
                                        </div>
                                    </div>
                                    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                        <div className="text-center">
                                            <button onClick={() => removeFromBag(m._id)} className="btn btn-outline-dark mt-auto" >Remove from bag</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ))}

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-5 bg-dark">
                <div className="container">
                    <p className="m-0 text-center text-white">
                        Copyright &copy; <a target="_blank" href="https://petkov-it.com/">Dimitar Petkov</a>
                    </p>
                </div>
            </footer>
        </>
    );
}
