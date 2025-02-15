import React, { useEffect, useState } from "react";
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

const LevelZero: React.FC = () => {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [shuffled, setShuffled] = useState<SelectedSentence | null>(null);

	const [message, setMessage] = useState<Message[]>([]);
	const [correctSound, setCorrectSound] = useState<ArrayBuffer | null>(null);
	const [soundAndChar, setSoundAndChar] = useState<SoundAndChar[]>([]);

	const [selected, setSelected] = useState<BreakdownItem | null>(null);
	const [listOfBrakeDown, setListOfBrakeDown] = useState<BreakdownItem[]>([]);
	const [worngRandom, setWorngRandom] = useState<BreakdownItem[]>([]);

	useEffect(() => {
		const fetchSentences = async () => {
			try {
				const response = await fetch("/firstlvl.json");
				const data = await response.json();

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

			const random: BreakdownItem[] = listOfBrakeDown
				.filter(item => item.character !== selected.character)
				.sort(() => 0.5 - Math.random())
				.slice(0, 4);

			random.push(selected);
			random.sort(() => Math.random() - 0.5);

			const allText = random.map((item) => {
				return item.character
			});

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

			setWorngRandom(random);
			setSelected(selected);

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
	}

	function checkAnswer(this: any) {
		if (selected === null) {
			return;
		}

		if (message.length === 0) {
			return;
		}


		const correct = selected.character === message[0].chineseChar;
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
	}

	function getNewSentence() {
		const newSentences = listOfBrakeDown.slice(1);

		if (newSentences.length === 0) {
			window.location.href = "/level-one";
		}

		setMessage([]);
		setListOfBrakeDown(newSentences);
		setSelected(null);
	}

	if (selected === null) {
		return <p>Loading...</p>;
	}

	//function playSound() {

	//	if (selected === null) {
	//		return;
	//	}

	//	const bufferData = new Uint8Array(selected.chineseSound.data);
	//	const blob = new Blob([bufferData], { type: 'audio/wav' });
	//	const url = URL.createObjectURL(blob);
	//	const audio = new Audio(url);

	//	audio.play();
	//}

	//const clearMessage = () => {
	//	setMessage([]);

	//	const pinIn: ChineseCharAndSound[] = selected?.chineseCharAndSound.map((item, index) => {
	//		return {
	//			pinyin: item.pinyin,
	//			chineseChar: item.chineseChar,
	//			chineseSound: item.chineseSound,
	//			meaning: item.meaning
	//		};
	//	}).sort(() => Math.random() - 0.5);

	//	setShuffled({
	//		chineseSentence: selected?.chineseSentence,
	//		chineseSound: selected?.chineseSound,
	//		chineseCharAndSound: pinIn,
	//		tranlation: selected?.tranlation
	//	});

	//	console.log("pinIn", pinIn);

	//}

	return (
		<div className="level-container">
			<h2 className="level-title">Level 1: Pinyin practice</h2>
			<h3 className="level-instructions">Listen to the pinyin and select the correct characters</h3>
			<div className="level-card">
				<button className="play-button" onClick={() => void (0)}>
					🔉
				</button>
				<div
					className="sentence-wrapper"
				>
					<h3 className="sentence">{selected.character}</h3>

				</div>
				<p className="level-translation">{selected.meaning}</p>
				<div className="options">
					{

						worngRandom.map((item, index) => (
							<button key={index} onClick={() => getPinyin(item)}
								className="option-button">
								{item.pinyin}
							</button>
						))

					}
				</div>
				<h3 className="user-answer">Your Answer:</h3>
				<p className="user-answer">
					{message.map((item) => item.chineseChar).join("")}
				</p>
				<h3 className="user-answer">Pinyin:</h3>
				<p className="user-answer">
					{message.map((item) => item.pinyin).join("")}
				</p>
				<button onClick={message[0]?.chineseChar === "✅ Correct!" ? getNewSentence : checkAnswer} className="check-button">
					{message[0]?.chineseChar === "✅ Correct!" ? "Next" : "Check"}
				</button>
				<br />
				<a className="skip-button" onClick={() => void (0)}>Clear</a>
				<br />
			</div>
		</div >
	);
}
export default LevelZero;
