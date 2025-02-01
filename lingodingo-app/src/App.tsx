import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home"
import DashboardPage from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import LevelOne from "./pages/lvls/lvlOne/lvlOne";
import LevelTwo from "./pages/lvls/lvlTwo/lvlTwo";


import "./App.css";

const App: React.FC = () => {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/dashboard" element={<DashboardPage />} />
				<Route path="/level-one" element={<LevelOne />} />
				<Route path="/level-two" element={<LevelTwo />} />
			</Routes>
		</Router>
	);
};

export default App;

