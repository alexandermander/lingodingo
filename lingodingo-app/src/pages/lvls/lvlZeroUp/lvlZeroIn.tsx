import React, { useEffect, useState, useRef } from "react";
import "../LevelCss.css";
import SentenceBreakdown, {
	SelectedSentence,
	BreakdownItem,
	Message,
	Sentence,
	ChineseCharAndSound,
	SoundAndChar,
	SoundBuffer
} from "../SentenceBreakdown";

import {
	fetchAudio,
	getCorretSound
} from "../getCompurents"


interface SentenceProps {
	currentSentence: Sentence[];
	onComplete: () => void;
}

const LevelZeroIn: React.FC<SentenceProps> = ({ currentSentence, onComplete }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState<Message[]>([]);
	const [correctSound, setCorrectSound] = useState<ArrayBuffer | null>(null);
	const [soundAndChar, setSoundAndChar] = useState<SoundAndChar[]>([]);

	const [selected, setSelected] = useState<BreakdownItem | null>(null);
	const [listOfBrakeDown, setListOfBrakeDown] = useState<BreakdownItem[]>([]);
	const [worngRandom, setWorngRandom] = useState<BreakdownItem[]>([]);

	const [inputValue, setInputValue] = useState("");

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	useEffect(() => {
		const fetchSentences = async () => {
			try {
				let data;
				if (currentSentence.length > 0) {
					data = currentSentence;
				} else {
					const response = await fetch("/firstlvl.json");
					data = await response.json();
				}

				const listOfBrakeDown: BreakdownItem[] = [];
				const brakeDown = data.map((sentence: Sentence) => {
					sentence.breakdown.map((item) => {
						listOfBrakeDown.push(item);
					});
				});

				const uniqueBrakeDown = listOfBrakeDown.filter((item, index, self) => {
					return index === self.findIndex((t) => (
						t.character === item.character
					));
				}).sort(() => Math.random() - 0.5);

				setListOfBrakeDown(uniqueBrakeDown);


			} catch (error) {
				console.error("Error fetching sentences:", error);
			}
		};

		fetchSentences()
		getCorretSound().then((data) => {
			setCorrectSound(data)
		})

	}, []);


	useEffect(() => {
		if (listOfBrakeDown.length > 0) {

			const selected = listOfBrakeDown[0];
			console.log(listOfBrakeDown);

			const allText = [selected.character];

			fetchAudio(allText).then((sounds) => {
				const soundAndChar: SoundAndChar[] = [];

				sounds.forEach((word: any) => {
					const bufferData = new Uint8Array(word.sound.data);
					const blob = new Blob([bufferData], { type: 'audio/wav' });
					const url = URL.createObjectURL(blob);
					soundAndChar.push({ sound: url, char: word.chinese });
				});

				setSoundAndChar(soundAndChar);
			});

			setSelected(selected);
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	}, [listOfBrakeDown]);

	function getPinyin(selected: BreakdownItem) {
		console.log("selected", selected);

		const selectedSound = soundAndChar.find((item) => {
			return item.char === selected.character;
		});
		if (!selectedSound) {
			console.error("No sound found for character:", selected.character);
			return;
		}

		//find the sound and play it
		const audio = new Audio(selectedSound.sound);
		audio.play();

		setMessage([{ chineseChar: selected.character, pinyin: selected.pinyin }]);
		if (message[0]?.chineseChar === "✅ Correct!") {
			return;
		}
		updateLvlInDataBase(false);
	}

	function updateLvlInDataBase(state: boolean) {
		console.log("updateLvlInDataBase", state);
		let currentPoints = 0;
		if (state) {
			currentPoints = -1;
		} else {
			currentPoints = 1;
		}

		if (selected?.character == null) {
			return;
		}

		console.log("lerningPoints", state, currentPoints, selected);

		const featchData = async () => {
			const response = await fetch("http://localhost:3002/setTraining", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					lerningPoints: currentPoints,
					character: selected.character,
				}),
			});
			const data = await response.json();
			console.log(data);
		};

		featchData();
	}

	function checkAnswer(this: any) {
		if (selected === null) {
			return;
		}

		const correct = selected.character === inputValue;
		if (correct) {
			setMessage([{ chineseChar: "✅ Correct!", pinyin: "" }]);

			if (correctSound != null) {
				setMessage([{ chineseChar: "✅ Correct!", pinyin: "" }]);
				const url = URL.createObjectURL(new Blob([correctSound], { type: 'audio/mpeg' }));
				const audio = new Audio(url);
				audio.play();
			}

		} else {
			setMessage([{ chineseChar: "❌ Wrong!", pinyin: "" }]);
		}

		updateLvlInDataBase(correct);
	}

	function getNewSentence() {
		const newSentences = listOfBrakeDown.slice(1);

		if (newSentences.length === 0 && currentSentence.length === 0) {
			window.location.href = "/level-one";
		} else if (newSentences.length === 0 && currentSentence.length > 0) {
			onComplete();
		}

		setInputValue("");
		setMessage([]);
		setListOfBrakeDown(newSentences);
		setSelected(null);
	}

	if (selected === null) {
		return <div>Loading...</div>;
	}

	//play main sound for the sentence
	function playSound() {
		console.log("selected", soundAndChar);

		const audio = new Audio(soundAndChar[0].sound);
		audio.play();
		updateLvlInDataBase(false);
	}

	function pressEnter(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			if (message[0]?.chineseChar === "✅ Correct!") {
				getNewSentence();
				return;
			}
			checkAnswer();
		}
	}

	return (
		<div className="level-container">
			<h2 className="level-title">Level 1: Pinyin practice</h2>
			<h3 className="level-instructions">Listen to the pinyin and select the correct characters</h3>
			<div className="level-card">
				<button className="play-button" onClick={() => playSound()}>
					🔉
				</button>
				<div
					className="sentence-wrapper" >
					<h3 className="sentence">{selected.character}</h3>
				</div>
				<p className="level-translation">{selected.meaning}</p>
				<h3 className="user-answer">Your Answer:</h3>
				<div className="options">
					<input ref={inputRef} className="input-box" value={inputValue} onChange={handleInputChange} onKeyPress={pressEnter} />
				</div>
				<p className="user-answer">
					{message.map((item) => item.chineseChar).join("")}
				</p>
				<h3 className="user-answer">Pinyin:</h3>
				{message[0]?.chineseChar === "✅ Correct!" ? (
					<p className="" >
						{selected.pinyin}
					</p>
				) : (
					<p className="user-answer">
						{message.map((item) => item.pinyin).join("")}
					</p>
				)}
				<div className="" style={{
					display: "flex", flexDirection: "column",
					justifyContent: "center",
					alignItems: "center"
				}}>
					<button onClick={message[0]?.chineseChar === "✅ Correct!" ? getNewSentence : checkAnswer} className="check-button">
						{message[0]?.chineseChar === "✅ Correct!" ? "Next" : "Check"}
					</button>
					<button className="show-correct-answer" onClick={() => getPinyin(selected)}>Get Pinyin</button>
				</div>
			</div>
		</div >
	);
}
export default LevelZeroIn;
