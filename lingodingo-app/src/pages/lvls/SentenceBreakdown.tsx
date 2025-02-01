import React, { useState } from 'react';
import './sentenceBreakdown.css';

export interface WordBreakdown {
	character: string;
	pinyin: string;
	meaning: string;
}

export interface SentenceData {
	chinese: string;
	pinyin: string;
	translation: string;
	breakdown: WordBreakdown[];
}

interface SentenceBreakdownProps {
	data: SentenceData;
}

const SentenceBreakdown: React.FC = () => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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


	return (
		<div className="sentence-breakdown">
			{data.breakdown.map((word, index) => (
				<span
					key={index}
					className="word"
					onMouseEnter={() => setHoveredIndex(index)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					{word.character}
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
