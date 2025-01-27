import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="container">
			<div className="card">
				<h2>Welcome to LingoDingo!</h2>
				<p>
					Learn languages in an engaging and interactive way. Master grammar, vocabulary, and pronunciation through fun challenges and deep insights.
				</p>
				<button className="cta-button" onClick={() => navigate("/level-one")}>
					Start Learning Now
				</button>
			</div>
		</div>
	);
};

export default HomePage;

