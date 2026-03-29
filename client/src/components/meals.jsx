import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";


const API = "http://localhost:5000";

export default function Meals({ token }) {
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const fetchMeals = async () => {
    const res = await axios.get(`${API}/meals`, { headers: { Authorization: token } });
    setMeals(res.data);
  };

  const addMeal = async () => {
    const res = await axios.post(`${API}/meals`, { mealName, price, description, image }, { headers: { Authorization: token } });
    console.log(image)
    fetchMeals()
  }

  const deleteMeal = async (id) => {
    const res = await axios.delete(`${API}/meals/${id}`, { headers: { Authorization: token } });
    fetchMeals()
  }

  useEffect(() => { if (token) fetchMeals(); }, [token]);


  return (
    <div >

      <div className="flex justify-center max-w-xl mx-auto mt-5">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 border p-2 rounded"
            placeholder="Meal name"
            onChange={e => setMealName(e.target.value)}
          />
          <input
            type="number"
            className="flex-1 border p-2 rounded"
            placeholder="Enter price"
            onChange={e => setPrice(e.target.value)}
          />
          <input
            type="text"
            className="flex-1 border p-2 rounded"
            placeholder="Enter description"
            onChange={e => setDescription(e.target.value)}
          />
          <input
            type="text"
            className="flex-1 border p-2 rounded"
            placeholder="Enter image url"
            onChange={e => setImage(e.target.value)}
          />

          <button
            className="bg-green-500 text-white px-4 rounded"
            onClick={addMeal}
          >
            Add meal
          </button>
        </div>
      </div>
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
                      <button onClick={() => deleteMeal(m._id)} className="btn btn-outline-dark mt-auto" >Delete meal</button>
                    </div>
                  </div>
                </div>
              </div>

            ))}

          </div>
        </div>
      </section>
      <Footer />
    </div>

  );
}