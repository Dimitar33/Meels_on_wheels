import React from "react";
import menu from "../lib/meals.jsx"
import { useState, useEffect } from "react";
import axios from "axios";
import Footer from "./footer.jsx";

const API = "http://localhost:5000";

export default function Sales({ token, bagCount, setBagCount }) {

    const [bag, setBag] = useState([]);
    const [orders, setOrders] = useState([]);
    const [income, setIncome] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const fetchBag = async () => {
        const res = await axios.get(`${API}/bag`, { headers: { Authorization: token } });
        setBag(res.data);
        setBagCount(res.data.reduce((sum, meal) => sum += meal.quantity, 0));
        setTotalPrice(res.data.reduce((sum, meal) => sum += (meal.quantity * meal.meal.price), 0));
    }

    const fetchOrders = async () => {
        const res = await axios.get(`${API}/orders`, { headers: { Authorization: token } });
        setOrders(res.data);
        setIncome(res.data.reduce((sum, order) => sum += order.total, 0));
    }



    useEffect(() => { if (token) fetchOrders(); }, [token])

    return (
        <>

            <section className="py-5">
                <div className="container px-4 px-lg-5 mt-5">
                    <div className="row gx-4 gx-lg-5 row-cols-1 row-cols-sm-2  row-cols-md-3 row-cols-xl-4 justify-content-center">

                        {orders.map((order, index) => (
                            <div key={index} className="card mb-5 m-1">

                                <div className="card-header">
                                    <strong>Order #{index + 1}</strong> <br />
                                    User: {order.user} <br />
                                    Date: {new Date(order.created).toLocaleString()} <br />
                                    Total: ${order.total}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="card-footer text-center bg-success text-white rounded">
                                <strong>Subtotal: ${income.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
