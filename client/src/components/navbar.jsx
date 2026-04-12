import React from "react"
import { Link, useNavigate } from "react-router-dom";

export default function navbar({ bagCount, setToken, user }) {

    const navigate = useNavigate();
    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
                <div className="container px-4 px-lg-5">
                    <a className="navbar-brand" href="#!">Meels on wheels</a>

                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                        <li className="nav-item">
                            <Link className="nav-link active" aria-current="page" to="/menu">Menu</Link>
                        </li>
                        {user?.isAdmin ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link active" aria-current="page" to="/meals">Meals</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link active" aria-current="page" to="/notes">Notes</Link>
                                </li>
                                <li className="nav-item">
                                    <button onClick={logout} className="nav-link" to="#!">Logout</button>
                                </li></>) : (

                            <li className="nav-item">
                                <button onClick={logout} className="nav-link" to="#!">Logout</button>
                            </li>
                        )}
                    </ul>

                    <form className="d-flex">
                        <Link className="btn btn-outline-dark" to="/bag">
                            <i className="bi-cart-fill me-1"></i>
                            Bag
                            <span className="badge bg-dark text-white ms-1 rounded-pill">{bagCount}</span>
                        </Link>
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
        </>
    )
}
