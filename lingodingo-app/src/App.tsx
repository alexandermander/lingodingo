import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home"
import DashboardPage from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import LevelOne from "./pages/lvls/lvlOne/lvlOne";
import LevelTwo from "./pages/lvls/lvlTwo/lvlTwo";
import LevelTree from "./pages/lvls/lvlTree/lvlTree";


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
				<Route path="/level-tree" element={<LevelTree />} />
			</Routes>
		</Router>
	);
};

export default App;

