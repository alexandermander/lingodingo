import React, { useEffect, useState } from "react";
import LevelZero from "../lvlZero/lvlZero";
import LevelZeroIn from "../lvlZeroUp/lvlZeroIn";

import { Sentence, BreakdownItem } from "../SentenceBreakdown";

export default function Train() {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [currentStage, setCurrentStage] = useState(0);
	const [alleOtherSentences, setAllOtherSentences] = useState<Sentence[]>([]);
	const [level, setLevel] = useState<number[]>([]);
	const [currentLvl, setCurrentLvl] = useState<number>(0);

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

		const getLevel = async () => {
			const response = await fetch("http://localhost:3002/getLvls", {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			console.log("data", data);

			setLevel(data);
			return data;
		};

		getLevel();

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

	async function handlePressOfTraining(getLvlno: number) {

		setCurrentLvl(getLvlno);

		const getLevelData = async () => {
			const url = "http://localhost:3002/getTrainingMaterial?lvl=" + getLvlno
			const response = await fetch(url, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			return data;
		}

		const data = await getLevelData();
		data.sort(() => Math.random() - 0.5);
		console.log("data", data);

		const fetchedSentences = data.slice(0, 3);
		const fetchedAllOtherSentences = data.slice(3)

		console.log("fetchedSentences", fetchedSentences);

		const removeCharList = await updateTheList(fetchedSentences);
		console.log("getTheList", removeCharList, fetchedSentences);

		const brakeDown = fetchedSentences.map((sentence: Sentence) => {
			sentence.breakdown = sentence.breakdown.filter((item) => {
				return !removeCharList.includes(item.character);
			});
		});

		console.log("fetchedSentences", fetchedSentences);

		setAllOtherSentences(fetchedAllOtherSentences);
		setSentences(fetchedSentences);

		console.log("data", data);


	}

	if (level.length === 0) {
		return < div > Loading...</div >;
	}

	if (sentences.length === 0) {
		return (
			<div
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<h1>Traning Material</h1>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						marginTop: '40px',
					}}>

					{level.map((challenge: number) => (
						<div className='thumbnail-card' style={{
						}} key={challenge}
							onClick={() => handlePressOfTraining(challenge)}

						>
							<h3>Level: {challenge}  </h3>
							<div>
								Click to start the training
							</div>
						</div>
					))}
				</div>

			</ div>
		);

	}

	return (
		<div>
			{currentStage === 0 ? (
				<LevelZero currentSentence={sentences} onComplete={() => setCurrentStage(1)} />
			) : (
				<LevelZeroIn currentSentence={sentences} onComplete={() => setCurrentStage(2)} lvl={currentLvl} />
			)}
		</div>
	)

}
