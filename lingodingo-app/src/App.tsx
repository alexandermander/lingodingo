import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home"
import DashboardPage from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import LevelOne from "./pages/lvls/lvlOne/lvlOne";
import LevelTwo from "./pages/lvls/lvlTwo/lvlTwo";
import LevelTree from "./pages/lvls/lvlTree/lvlTree";
import LevelZero from "./pages/lvls/lvlZero/lvlZero";
import LevelZeroIn from "./pages/lvls/lvlZeroUp/lvlZeroIn";
import Train from "./pages/lvls/trainPage/train"

import SentenceBreakdown, {
	Sentence,
} from "./pages/lvls/SentenceBreakdown"

import "./App.css";

const App: React.FC = () => {

	//create empty array
	const someTest: Sentence[] = [];

	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/dashboard" element={<DashboardPage />} />
				<Route path="/level-zero" element={<LevelZero currentSentence={someTest} onComplete={() => { }} />} />
				<Route path="/level-zero-in" element={<LevelZeroIn currentSentence={someTest} onComplete={() => { }} />} />
				<Route path="/level-one" element={<LevelOne />} />
				<Route path="/level-two" element={<LevelTwo />} />
				<Route path="/level-tree" element={<LevelTree />} />
				<Route path="/train" element={<Train />} />
			</Routes>
		</Router>
	);
};

export default App;

