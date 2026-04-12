import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import Footer from "./footer.jsx";

const API = "http://localhost:5000";

export default function Menu({ token, setBagCount }) {

    const [meals, setMeals] = useState([]);

    const fetchMeals = async () => {
        const res = await axios.get(`${API}/meals`, { headers: { Authorization: token } })
        setMeals(res.data)
    }

      const fetchBag = async () => {
        const res = await axios.get(`${API}/bag`, { headers: { Authorization: token } });
        setBagCount(res.data.reduce((sum, meal) => sum += meal.quantity, 0));
    }

    const addToBag = async (item) => {
        await axios.post(`${API}/bag`, { mealId: item._id }, { headers: { Authorization: token } })
        setBagCount(count => count + 1);
    }

    useEffect(() => { if (token) fetchMeals(); fetchBag(); }, [token])

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
