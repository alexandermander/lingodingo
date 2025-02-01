import React, { useEffect, useState } from "react";
import "../LevelCss.css";
import SentenceBreakdown, { SentenceData } from '../SentenceBreakdown';

type BreakdownItem = {
	character: string;
	meaning: string;
};

type Sentence = {
	chinese: string;
	pinyin: string;
	translation: string;
	breakdown: BreakdownItem[];
};

interface SoundBuffer {
	data: number[];
}

type ChineseCharAndSound = {
	chineseChar: string;
	chineseSound: SoundBuffer;
	pinyin: string;
};

type SelectedSentence = {
	chineseSentence: string;
	chineseSound: SoundBuffer;
	chineseCharAndSound: ChineseCharAndSound[];
	tranlation: string;
};

type Message = {
	chineseChar: string;
	pinyin: string;
};

const LevelOne: React.FC = () => {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [selected, setSelected] = useState<SelectedSentence | null>(null); // Initialize as null
	const [message, setMessage] = useState<Message[]>([]);
	const [correctSound, setCorrectSound] = useState<ArrayBuffer | null>(null);
	const [mySentenceData, setMySentenceData] = useState<SentenceData | null>(null);


	const getFormat = async (word: string) => {
		//http://192.168.1.131:8000/generate?api_word={word}
		const request = fetch('http://192.168.1.131:8000/generate?api_word=' + word, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const response = await request;
		console.log("response", response)
	}

	const getCorretSound = async () => {
		const response = await fetch('/corrktSound.mp3', {
			method: 'get',
			headers: {
				'Content-Type': 'audio/mpeg',
			},
		});

		const data = await response.arrayBuffer();
		setCorrectSound(data);
	}

	const fetchAudio = async (text: string[]) => {
		try {
			console.log("text", JSON.stringify({ text }));
			const response = await fetch('http://192.168.1.68:3001/synthesize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text }),
			});
			if (!response.ok) {
				throw new Error('Failed to fetch audio');
			}
			const data = await response.json()

			const listOfsounds = data.map((item: any, index: number) => {
				return {
					chinese: item.text,
					sound: item.audioData
				};
			});

			return listOfsounds;

		} catch (err) {
			console.error('Error fetching audio:', err);
		}
	};

	useEffect(() => {
		const fetchSentences = async () => {
			try {
				const response = await fetch("/firstlvl.json");
				const data = await response.json();
				data.sort(() => Math.random() - 0.5);

				setSentences(data);

			} catch (error) {
				console.error("Error fetching sentences:", error);
			}
		};

		fetchSentences()
		getCorretSound();
	}, []);


	useEffect(() => {
		if (sentences.length > 0) {
			const sentence = sentences[2];
			console.log("sentence", sentence);

			const brakeChar = sentence.breakdown.map((item) => {
				return item.character
			});

			const allText = [...brakeChar, sentence.chinese];

			fetchAudio(allText).then((sounds) => {
				let lastElement = sounds[sounds.length - 1];
				let newSounds = sounds.slice(0, sounds.length - 1);

				let pinyinList = sentence.pinyin.split(" ");
				const selectedSentence: SelectedSentence = {
					chineseSentence: sentence.chinese,
					chineseSound: lastElement.sound,
					chineseCharAndSound: sentence.breakdown.map((item, index) => {
						return {
							pinyin: pinyinList[index].toLowerCase(),
							chineseChar: item.character,
							chineseSound: newSounds[index].sound
						};
					}),
					tranlation: sentence.translation
				};

				const shuffled = selectedSentence.chineseCharAndSound.sort(() => Math.random() - 0.5);

				// set the selected sentence
				selectedSentence.chineseCharAndSound = shuffled;

				setSelected(selectedSentence);
			});
		}
	}, [sentences]);

	function getPinyin(selected: ChineseCharAndSound) {

		console.log("selected", message[0]?.pinyin);

		const bufferData = new Uint8Array(selected.chineseSound.data);
		const blob = new Blob([bufferData], { type: 'audio/wav' });
		const url = URL.createObjectURL(blob);

		const audio = new Audio(url);
		audio.play();

		if (message[0]?.pinyin === "WORNG") {
			console.log("INSTETETHIETIEIHTI");
			setMessage([{ chineseChar: selected.chineseChar, pinyin: selected.pinyin }]);
		}
		else {
			setMessage([...message, { chineseChar: selected.chineseChar, pinyin: selected.pinyin }]);
		}

	}

	function checkAnswer() {
		if (selected === null) {
			return;
		}
		const corrnctAnswer = selected.chineseSentence.replace(/。/g, "");
		const userAnswer = message.map((item) => item.chineseChar).join("");
		console.log("User answer:", userAnswer);
		console.log("Correct answer:", corrnctAnswer);

		const correct = corrnctAnswer === userAnswer;
		if (correct) {
			console.log("Correct!");
			if (correctSound != null) {
				setMessage([{ chineseChar: "✅ Correct!", pinyin: "" }]);
				const url = URL.createObjectURL(new Blob([correctSound], { type: 'audio/mpeg' }));
				const audio = new Audio(url);
				audio.play();
				setTimeout(() => {
					const sound = new Audio(URL.createObjectURL(new Blob([new Uint8Array(selected.chineseSound.data)], { type: 'audio/wav' })));
					sound.play()
				}, 500);
			}
		}

		else {
			console.log("Incorrect!");
			setMessage([{ chineseChar: "❌ Incorrect!", pinyin: "WORNG" }]);
		}
	}

	function getNewSentence() {
		console.log("getNewSentence");

		// pop the first sentence from the array
		const newSentences = sentences.slice(1);
		setMessage([]);
		setSentences(newSentences);
	}

	if (selected === null) {
		return <p>Loading...</p>;
	}

	function playSound() {

		if (selected === null) {
			return;
		}

		const bufferData = new Uint8Array(selected.chineseSound.data);
		const blob = new Blob([bufferData], { type: 'audio/wav' });
		const url = URL.createObjectURL(blob);
		const audio = new Audio(url);

		audio.play();
	}

	function getWordExpalation() {
		const data: SentenceData = {
			chinese: "我们晚上去吃饭吧。",
			pinyin: "Wǒmen wǎnshang qù chīfàn ba.",
			translation: "Let's go eat dinner tonight.",
			breakdown: [
				{
					character: "我们",
					pinyin: "wǒ men",
					meaning: "we/us (我 = I/me, 们 = plural marker)"
				},
				{
					character: "晚上",
					pinyin: "wǎn shang",
					meaning: "evening/night (晚 = evening, 上 = up/on)"
				},
				{
					character: "去",
					pinyin: "qù",
					meaning: "to go"
				},
				{
					character: "吃饭",
					pinyin: "chī fàn",
					meaning: "to eat a meal (吃 = eat, 饭 = rice/meal)"
				},
				{
					character: "吧",
					pinyin: "ba",
					meaning: "suggestion particle (softens the sentence)"
				}
			]
		};
		setMySentenceData(data);
	}

	return (
		<div className="level-container">
			<h2 className="level-title">Level 1: Pinyin practice</h2>
			<h3 className="level-instructions">Listen to the pinyin and select the correct characters</h3>
			<div className="level-card">
				<button className="play-button" onClick={() => playSound()}>
					🔉
				</button>
				<h2 className="level-sentence">{selected.chineseSentence}</h2>
				<div
					className="sentence-wrapper"
				>
				</div>

				<p className="level-translation">{selected.tranlation}</p>
				<div className="options">
					{
						selected.chineseCharAndSound.map((item, index) => (
							<button key={index} onClick={() => getPinyin(item)} className="option-button">
								{item.pinyin}
							</button>
						))
					}
				</div>
				<h3 className="user-answer">Your Answer:</h3>
				<p className="user-answer">
					{message.map((item) => item.chineseChar).join("")}
				</p>
				<button onClick={message[0]?.chineseChar === "✅ Correct!" ? getNewSentence : checkAnswer} className="check-button">
					{message[0]?.chineseChar === "✅ Correct!" ? "Next" : "Check"}
				</button>
				<br />
				<br />
				<a className="skip-button" onClick={() => setMessage([])}>clear</a>
			</div>
		</div >
	);
}

export default LevelOne;
