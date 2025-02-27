import React, { useEffect, useState } from "react";
import LevelZero from "../lvlZero/lvlZero";
import LevelZeroIn from "../lvlZeroUp/lvlZeroIn";

import { Sentence, BreakdownItem } from "../SentenceBreakdown";

export default function Train() {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [currentStage, setCurrentStage] = useState(0);
	const [alleOtherSentences, setAllOtherSentences] = useState<Sentence[]>([]);


	async function updateTheList(listOfSentences: Sentence[]) {
		const getAlleBrakeDown: String[] = [];
		const brakeDown = listOfSentences.map((sentence: Sentence) => {
			sentence.breakdown.map((item) => {
				getAlleBrakeDown.push(item.character);
			});
		});

		const response = await fetch("http://localhost:3002/getTraining", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ getAlleBrakeDown }),
		});
		const data = await response.json();

		return data;
	}

	useEffect(() => {
		const fetchSentences = async () => {
			try {
				const response = await fetch("/firstlvl.json");
				const data = await response.json();

				data.sort(() => Math.random() - 0.5);

				console.log("data", data);

				const fetchedSentences = data.slice(0, 3);
				const fetchedAllOtherSentences = data.slice(3)

				console.log("fetchedSentences", fetchedSentences);

				const removeCharList = await updateTheList(fetchedSentences);
				console.log("getTheList", removeCharList, fetchedSentences);

				// filter all the brakeDowns where the character is in the removeCharList
				const brakeDown = fetchedSentences.map((sentence: Sentence) => {
					sentence.breakdown = sentence.breakdown.filter((item) => {
						return !removeCharList.includes(item.character);
					});
				});
				console.log("fetchedSentences", fetchedSentences);

				setAllOtherSentences(fetchedAllOtherSentences);
				setSentences(fetchedSentences);
			} catch (error) {
				console.error("Error fetching sentences:", error);
			}
		};

		fetchSentences();
	}, []);

	useEffect(() => {
		const fetchSentences = async () => {
			console.log("alleOtherSentences", alleOtherSentences);

			const newSentence = alleOtherSentences.slice(0, 3);
			const newAllOtherSentences = alleOtherSentences.slice(3);

			const removeCharList = await updateTheList(newSentence);
			const brakeDown = newSentence.map((sentence: Sentence) => {
				sentence.breakdown = sentence.breakdown.filter((item) => {
					return !removeCharList.includes(item.character);
				});
			});

			setAllOtherSentences(newAllOtherSentences);
			setSentences(newSentence);
			setCurrentStage(0);
		}

		if (currentStage === 2) {
			fetchSentences();
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
