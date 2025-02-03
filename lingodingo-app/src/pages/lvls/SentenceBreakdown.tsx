import React, { useState, useEffect } from 'react';
import './sentenceBreakdown.css';

export type BreakdownItem = {
	character: string;
	pinyin: string;
	meaning: string;
};

export type Sentence = {
	chinese: string;
	pinyin: string;
	translation: string;
	breakdown: BreakdownItem[];
};

export interface SoundBuffer {
	data: number[];
}

export type ChineseCharAndSound = {
	chineseChar: string;
	chineseSound: SoundBuffer;
	pinyin: string;
	meaning: string;
};

export type SelectedSentence = {
	chineseSentence: string;
	chineseSound: SoundBuffer;
	chineseCharAndSound: ChineseCharAndSound[];
	tranlation: string;
};

export type Message = {
	chineseChar: string;
	pinyin: string;
};

export type SoundAndChar = {
	sound: string;
	char: string;
};

const SentenceBreakdown: React.FC<SelectedSentence> = (currentSentence) => {

	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [soundAndChar, setSoundAndChar] = useState<SoundAndChar[]>([]);

	useEffect(() => {
		const sounds: SoundAndChar[] = [];

		currentSentence.chineseCharAndSound.forEach((word) => {
			const bufferData = new Uint8Array(word.chineseSound.data);
			const blob = new Blob([bufferData], { type: 'audio/wav' });
			const url = URL.createObjectURL(blob);
			sounds.push({ sound: url, char: word.chineseChar });
		});

		setSoundAndChar(sounds);
	}, [currentSentence]);

	function playSound(currntChar: string) {
		const selected = soundAndChar.find((item) => item.char === currntChar);
		if (!selected) {
			return;
		}

		const audio = new Audio(selected.sound);
		audio.play();
	}

	return (
		<div className="sentence-breakdown">
			{currentSentence.chineseCharAndSound.map((word, index) => (
				<span
					key={index}
					className="word"
					onMouseEnter={() => setHoveredIndex(index)}
					onMouseLeave={() => setHoveredIndex(null)}
					onClick={() => playSound(word.chineseChar)}
				>
					{word.chineseChar}
					{hoveredIndex === index && (
						<div className="popup-box">
							<div className="popup-content">
								<div className="pinyin">{word.pinyin}</div>
								<div className="meaning">{word.meaning}</div>
							</div>
							<div className="arrow" />
						</div>
					)}
				</span>
			))}
		</div>
	);
};

export default SentenceBreakdown;
