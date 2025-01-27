import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
	return (
		<nav className="navbar">
			<Link to="/" className="logo">LingoDingo</Link>
			<div className="nav-links">
				<Link to="/login" className="nav-item">Login</Link>
				<Link to="/dashboard" className="nav-item">Dashboard</Link>
			</div>
			<button className="menu-toggle" aria-label="Toggle Menu">
				☰
			</button>
		</nav>
	);
}

export default Navbar;
