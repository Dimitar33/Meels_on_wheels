import React, { useEffect } from "react";
import menu from "../lib/meals.jsx"
import { useState } from "react";
import axios from "axios";
import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";

const API = "http://localhost:5000";

export default function Menu({ token, bag, setBag }) {

    const [meals, setMeals] = useState([]);

    const fetchMeals = async () => {
        const res = await axios.get(`${API}/meals`, { headers: { Authorization: token } })
        setMeals(res.data)
    }

    const addToBag = async (item) => {
        setBag(prev => [...prev, item]);
        await axios.post(`${API}/bag`, { item }, { headers: { Authorization: token } })
    }

    useEffect(() => { if (token) fetchMeals(); }, [token])

    return (
        <>
            <section className="py-5">
                <div className="container px-4 px-lg-5 mt-5">
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">

                        {meals.map((m, key) => (
                            <div key={key} className="col mb-5">
                                <div className="card h-100">
                                    <img
                                        className="card-img-top"
                                        src={m.image}
                                        alt={m.name}
                                    />
                                    <div className="card-body p-4">
                                        <div className="text-center">
                                            <h5 className="fw-bolder">{m.mealName}</h5>
                                            {m.description} <br />
                                            ${m.price}
                                        </div>
                                    </div>
                                    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                        <div className="text-center">
                                            <button onClick={() => addToBag(m)} className="btn btn-outline-dark mt-auto" >Add to bag</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ))}

                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}
