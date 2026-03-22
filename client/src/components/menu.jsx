import React from "react";
import menu from "../lib/meals.jsx"

export default function Menu() {
    return (
        <>
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container px-4 px-lg-5">
                    <a className="navbar-brand" href="#!">Meels on wheels</a>

                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="#!">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#!">Logout</a>
                        </li>
                    </ul>

                    <form className="d-flex">
                        <button className="btn btn-outline-dark" type="submit">
                            <i className="bi-cart-fill me-1"></i>
                            Cart
                            <span className="badge bg-dark text-white ms-1 rounded-pill">0</span>
                        </button>
                    </form>

                </div>
            </nav>

            {/* Header */}
            <header className="bg-dark py-5">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bolder">The best meels you can find!</h1>
                        <p className="lead fw-normal text-white-50 mb-0">
                            Healthy and tasty.
                        </p>
                    </div>
                </div>
            </header>

            {/* Menu */}

            <section className="py-5">
                <div className="container px-4 px-lg-5 mt-5">
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">

                        {menu.map((m, key) => (
                            <div key={key} className="col mb-5">
                                <div className="card h-100">
                                    <img
                                        className="card-img-top"
                                        src={m.image}
                                        alt={m.name}
                                    />
                                    <div className="card-body p-4">
                                        <div className="text-center">
                                            <h5 className="fw-bolder">{m.name}</h5>
                                            {m.description} <br />
                                            ${m.price}
                                        </div>
                                    </div>
                                    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                        <div className="text-center">
                                            <a className="btn btn-outline-dark mt-auto" href="#">Add to bag</a>
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
