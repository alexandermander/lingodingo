import React, { useEffect, useState } from "react";
import LevelZero from "../lvlZero/lvlZero";
import LevelZeroIn from "../lvlZeroUp/lvlZeroIn";

import { Sentence } from "../SentenceBreakdown";

export default function Train() {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [currentStage, setCurrentStage] = useState(0);
	const [alleOtherSentences, setAllOtherSentences] = useState<Sentence[]>([]);

	useEffect(() => {
		const fetchSentences = async () => {
			try {
				const response = await fetch("/firstlvl.json");
				const data = await response.json();

				data.sort(() => Math.random() - 0.5);

				const fetchedSentences = data.slice(0, 3);
				const fetchedAllOtherSentences = data.slice(3);
				setAllOtherSentences(fetchedAllOtherSentences);
				console.log("fetchedAllOtherSentences", fetchedAllOtherSentences);
				setSentences(fetchedSentences);
			} catch (error) {
				console.error("Error fetching sentences:", error);
			}
		};

		fetchSentences();
	}, []);

	useEffect(() => {
		if (currentStage === 2) {
			console.log("alleOtherSentences", alleOtherSentences);

			const newSentence = alleOtherSentences.slice(0, 3);
			const newAllOtherSentences = alleOtherSentences.slice(3);
			setAllOtherSentences(newAllOtherSentences);
			setSentences(newSentence);
			setCurrentStage(0);
		}
	}, [currentStage]);


	if (sentences.length === 0) {
		return <div>Loading...</div>
	}

	return (
		<div>
			{currentStage === 0 ? (
				<LevelZero currentSentence={sentences} onComplete={() => setCurrentStage(1)} />
			) : (
				<LevelZeroIn currentSentence={sentences} onComplete={() => setCurrentStage(2)} />
			)}
		</div>
	)

}
