import React, { useEffect, useState } from "react";
import "./LevelOne.css";

type BreakdownItem = {
	character: string;
	meaning: string;
};

interface SoundBuffer {
	data: number[];
}

type pinyin = {
	[key: string]: string;
};

type sound = {
	chinese: string;
	sound: SoundBuffer;
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
	const [pinyin, setPinyin] = useState<pinyin>({} as pinyin);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [message, setMessage] = useState<string[]>([]);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);

	const [sounds, setSounds] = useState<sound[]>([]);


	const fetchAudio = async (text: string[]) => {
		try {
			console.log("text", JSON.stringify({ text }));
			const response = await fetch('http://localhost:3001/synthesize', {
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

			setSounds(listOfsounds);
			console.log("listOfsounds", listOfsounds);
		} catch (err) {
			console.error('Error fetching audio:', err);
		}
	};

	useEffect(() => {

		const playAudio = () => {
			if (audioUrl) {
				console.log("audioUrl", audioUrl);
				const audio = new Audio(audioUrl);
				audio.play().catch((err) => console.error('Audio play failed:', err));
			}
		};

		playAudio();
	}, [audioUrl]);

	useEffect(() => {
		const fetchSentences = async () => {
			try {
				const response = await fetch("/firstlvl.json");
				const data = await response.json();
				data.sort(() => Math.random() - 0.5); // waht it the 0.5

				setSentences(data);
				if (data.length > 0) {
					return data[0]; // Return the first sentence
				}
			} catch (error) {
				console.error("Error fetching sentences:", error);
			}
		};

		fetchSentences().then(async (sentence) => {
			if (sentence) {
				setSelected(sentence); // Update selected state
				const pinyin = getPinyin(sentence);

				console.log("pinyin", pinyin);

				const pinyinValues = Object.values(pinyin);
				const chinese = sentence.chinese

				// make one array of all the pinyin and the one sentence
				const allChinese = [...pinyinValues, chinese];
				console.log("allChinese", allChinese);

				await fetchAudio(allChinese)

				setPinyin(pinyin);
			}
		});

	}, []);

	if (selected === null) {
		return <p>Loading...</p>; // Handle loading state
	}

	//async function getSound(chinese: string[]) {
	//	const sounds: sound[] = [];
	//	chinese.forEach(async (item) => {

	//		const sound = {
	//			chinese: item,
	//			sound: url
	//		};
	//		sounds.push(sound);
	//	});

	//	console.log("sounds", sounds);
	//}


	function getPinyin(current: any): pinyin {
		console.log("current", current);

		let pinyin = current.pinyin.split(" ");
		let chinese = current.chinese.split("");
		//remove the last character 。form the chinese array

		chinese = chinese.filter((item: any) => item !== "。");

		pinyin = pinyin.map((item: any) => item.replace(/[.?]/g, ""));
		pinyin = pinyin.map((item: any) => item.toLowerCase());

		const pinyinObj: pinyin = {};

		pinyin.forEach((item: any, index: any) => {
			pinyinObj[item] = chinese[index];
		});

		const shuffledPinyin = Object.keys(pinyinObj).sort(() => Math.random() - 0.5);

		const shuffledPinyinObj: pinyin = {};
		shuffledPinyin.forEach((item: any) => {
			shuffledPinyinObj[item] = pinyinObj[item];
		});

		return shuffledPinyinObj;
	}

	function getNewSentence() {
		const newSentences = sentences.filter((sentence) => sentence !== selected);
		setSentences(newSentences);

		if (newSentences.length > 0) {
			const nextSentence = newSentences[0];

			setSounds([]);

			setSelected(nextSentence);
			console.log("nextSentence", nextSentence);

			const pinyin = getPinyin(nextSentence);
			setPinyin(pinyin);

			const pinyinValues = Object.values(pinyin);
			const chinese = nextSentence.chinese

			// make one array of all the pinyin and the one sentence
			const allChinese = [...pinyinValues, chinese];

			fetchAudio(allChinese)


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


			// get correct answer and play the sound
			console.log("selected", corrnctAnswer);
			const bufferData = new Uint8Array((sounds[sounds.length - 1].sound.data));
			const blob = new Blob([bufferData], { type: "audio/mpeg" });
			const url = URL.createObjectURL(blob);
			setAudioUrl(url)
			setTimeout(() => {
				setMessage([]);
				getNewSentence();

			}, 2000);
		} else {
			setMessage(["❌ Try Again."]);
			setIsCorrect(false);
		}
	}


	async function addMessage(message: string, index: number) {
		if (isCorrect === false) {
			setMessage([]);
			setIsCorrect(true);
		}
		const value = pinyin[message];

		const bufferData = new Uint8Array((sounds[index].sound.data));
		const blob = new Blob([bufferData], { type: "audio/mpeg" });
		const url = URL.createObjectURL(blob);
		setAudioUrl(url);

		console.log("value", value);
		setMessage((prev: any) => [...prev, message]);
	}

	return (
		<div className="level-container">
			<h2 className="level-title">Level 1: Pinyin practice</h2>
			<div className="level-card">
				<h2 className="level-sentence">{selected.chinese}</h2>
				<p className="level-translation">{selected.translation}</p>
				<div className="options">
					{
						Object.keys(pinyin).map((item: any, index: number) => (
							<button key={index} onClick={() => addMessage(item, index)} className="option-button">
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

