import React, { useEffect, useState } from "react";

const fetchAudio = async (text: string[]) => {
	try {
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

const getCorretSound = async () => {
	const response = await fetch('/corrktSound.mp3', {
		method: 'get',
		headers: {
			'Content-Type': 'audio/mpeg',
		},
	});

	const data = await response.arrayBuffer();

	return data
}

export { fetchAudio, getCorretSound };
