import Ajv from "ajv";
import React, { useEffect, useState } from "react";
import "./LevelOne.css";

// Define types
type BreakdownItem = {
	character: string;
	meaning: string;
};

type Sentence = {
	chinese: string;
	pinyin: string[];
	translation: string;
	breakdown: BreakdownItem[];
};

const LevelOne: React.FC = () => {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [selected, setSelected] = useState<Sentence | null>(null); // Initialize as null
	const [pinyin, setPinyin] = useState<string[]>([]);

	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const [message, setMessage] = useState<string[]>([]);

	useEffect(() => {
		const fetchSentences = async () => {
			try {
				const response = await fetch("/firstlvl.json");
				const data = await response.json();
				//scampel data random so we can get random sentence
				data.sort(() => Math.random() - 0.5); // waht it the 0.5

				setSentences(data);
				if (data.length > 0) {
					return data[0]; // Return the first sentence
				}
			} catch (error) {
				console.error("Error fetching sentences:", error);
			}
		};

		fetchSentences().then((sentence) => {
			if (sentence) {
				console.log("Selected sentence:", sentence);
				setSelected(sentence); // Update selected state

				const pinyin = getPinyin(sentence.pinyin);
				setPinyin(pinyin);
			}
		});

	}, []);

	if (selected === null) {
		return <p>Loading...</p>; // Handle loading state
	}



	function getPinyin(current: any) {
		let pinyin = current.split(" ");
		pinyin = pinyin.map((item: any) => item.replace(/[.?]/g, ""));
		//make alle charactes to lower case
		pinyin = pinyin.map((item: any) => item.toLowerCase());


		pinyin.sort(() => Math.random() - 0.5);
		return pinyin;
	}


	function getNewSentence() {
		const newSentences = sentences.filter((sentence) => sentence !== selected);

		setSentences(newSentences);

		if (newSentences.length > 0) {
			const nextSentence = newSentences[0];
			setSelected(nextSentence);

			const pinyin = getPinyin(nextSentence.pinyin);
			setPinyin(pinyin);
		} else {
			setSelected(null);
		}
	}



	function checkAnswer() {
		if (selected === null) {
			return;
		}
		console.log("Correct answer:", selected.pinyin);
		console.log("User answer:", message.join(" "));

		const corrnctAnswer = selected.pinyin.toString().replace(/[.?]/g, "");
		const corrnctAnswerLower = corrnctAnswer.toLowerCase();

		const userAnswer = message.join(" ");
		const correct = corrnctAnswerLower === userAnswer;

		if (correct) {

			setMessage(["✅ Correct!"]);
			setIsCorrect(true);

			setTimeout(() => {
				setMessage([]);
				getNewSentence();
			}, 500);

		} else {
			setMessage(["❌ Try Again."]);
			setIsCorrect(false);
		}
	}

	function addMessage(message: string) {
		if (isCorrect === false) {
			setMessage([]);
			setIsCorrect(true);
		}
		setMessage((prev) => [...prev, message]);
	}

	return (
		<div className="level-container">
			<h2 className="level-title">Level 1: Pinyin practice</h2>
			<div className="level-card">
				<h2 className="level-sentence">{selected.chinese}</h2>
				<p className="level-translation">{selected.translation}</p>

				<div className="options">
					{
						pinyin.map((item, index) => (
							<button key={index} onClick={() => addMessage(item)} className="option-button">
								{item}
							</button>
						))
					}
				</div>
				<h3 className="user-answer">Your Answer:</h3>
				<p>{message.join(" ")}</p>
				<button onClick={() => checkAnswer()} className="check-button">Check</button>
			</div>
		</div>
	);
};

export default LevelOne;
