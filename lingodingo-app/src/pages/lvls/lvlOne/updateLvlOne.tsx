import React, { useEffect, useState } from "react";
import "../LevelCss.css";
import SentenceBreakdown, {
	SelectedSentence,
	Message,
	Sentence,
	ChineseCharAndSound,
	SoundAndChar,
	SoundBuffer
} from "../SentenceBreakdown";


const LevelOne: React.FC = () => {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [selected, setSelected] = useState<SelectedSentence | null>(null); // Initialize as null
	const [shuffled, setShuffled] = useState<SelectedSentence | null>(null);

	const [message, setMessage] = useState<Message[]>([]);
	const [correctSound, setCorrectSound] = useState<ArrayBuffer | null>(null);
	const [soundAndChar, setSoundAndChar] = useState<SoundAndChar[]>([]);

	const getFormat = async (word: string) => {
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
				//	data.sort(() => Math.random() - 0.5);

				setSentences(data);
				console.log("data", data);

			} catch (error) {
				console.error("Error fetching sentences:", error);
			}
		};

		fetchSentences()
		getCorretSound();
	}, []);


	useEffect(() => {
		if (sentences.length > 0) {

			const sentence = sentences[0];
			const brakeChar = sentence.breakdown.map((item) => {
				return item.character
			});

			const allText = [...brakeChar, sentence.chinese];

			fetchAudio(allText).then((sounds) => {
				let lastElement = sounds[sounds.length - 1];
				let newSounds = sounds.slice(0, sounds.length - 1);

				const selectedSentence: SelectedSentence = {
					chineseSentence: sentence.chinese,
					chineseSound: lastElement.sound,
					chineseCharAndSound: sentence.breakdown.map((item, index) => {
						return {
							pinyin: item.pinyin.toLowerCase(),
							chineseChar: item.character,
							chineseSound: newSounds.find((sound: any) => sound.chinese === item.character).sound,
							meaning: item.meaning
						};
					}),
					tranlation: sentence.translation
				};
				console.log("selectedSentence", selectedSentence);
				setSelected(selectedSentence);
				const shuffledSentence: SelectedSentence = {
					chineseSentence: sentence.chinese,
					chineseSound: lastElement.sound,
					chineseCharAndSound: sentence.breakdown.map((item, index) => {
						// if item allrady includes in the selectedSentence 
						return {
							pinyin: sentence.breakdown[index].pinyin.toLowerCase(),
							chineseChar: item.character,
							chineseSound: newSounds[index].sound,
							meaning: item.meaning
						};
					}).sort(() => Math.random() - 0.5),
					tranlation: sentence.translation
				};

				const currentSounds: SoundAndChar[] = [];
				selectedSentence.chineseCharAndSound.forEach((word) => {

					const bufferData = new Uint8Array(word.chineseSound.data);
					const blob = new Blob([bufferData], { type: 'audio/wav' });
					const url = URL.createObjectURL(blob);
					currentSounds.push({ sound: url, char: word.chineseChar });

				});
				// add the 	chineseSound: SoundBuffer; data

				const mainsound: SoundAndChar = {
					sound: URL.createObjectURL(new Blob([new Uint8Array(lastElement.sound.data)], { type: 'audio/wav' })),
					char: selectedSentence.chineseSentence
				};

				currentSounds.push(mainsound);
				console.log("currentSounds", currentSounds);

				setSoundAndChar(currentSounds);
				setShuffled(shuffledSentence);

			});
		}
	}, [sentences]);

	function getPinyin(selected: ChineseCharAndSound) {
		const selectedSound = soundAndChar.find((item) => item.char === selected.chineseChar);
		if (!selectedSound) {
			return;
		}

		const url = selectedSound.sound;
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
		const corrnctAnswer = selected.chineseSentence.replace(/[。！？]/g, "");
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

	return (
		<div className="level-container">
			<h2 className="level-title">Level 1: Pinyin practice</h2>
			<h3 className="level-instructions">Listen to the pinyin and select the correct characters</h3>
			<div className="level-card">
				<button className="play-button" onClick={() => playSound()}>
					🔉
				</button>
				<div
					className="sentence-wrapper"
				>
					<SentenceBreakdown {...selected} />
				</div>
				<p className="level-translation">{selected.tranlation}</p>
				<div className="options">
					{
						shuffled?.chineseCharAndSound.map((item, index) => (
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
