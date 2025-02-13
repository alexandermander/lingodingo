require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { ALL } = require('dns');

const app = express();

app.use(cors({
	origin: ['http://192.168.1.68:3000', 'http://localhost:3000'], // only allow requests from this domain
	methods: ['GET', 'POST'], // only allow specific HTTP methods
}));


app.use(express.json()); // Middleware to parse JSON body

const port = 3001;

console.log("Starting server...");


// 1. Retrieve Speech Key and Service Region
const speechKey = process.env.SPEECH_KEY;
const serviceRegion = process.env.SERVICE_REGION;

// 2. Validate
if (!speechKey || !serviceRegion) {
	throw new Error("Please set SPEECH_KEY and SERVICE_REGION in your .env file.");
}

// 3. Create SpeechConfig
const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, serviceRegion);

// 4. Optionally set the voice name
speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoMultilingualNeural";

// 5. Create an endpoint to synthesize speech

function saveAudioToFile(audioData, filename) {
	const dir = path.join(__dirname, 'savedSounds');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
	}
	// Convert the array buffer to a Buffer object
	const buffer = Buffer.from(audioData);

	filename = filename.replace(/。/g, "");
	// Save the buffer to a file
	fs.writeFile(path.join(dir, filename), buffer, 'binary', (err) => {
		if (err) {
			console.error("Error saving audio file:", err);
		} else {
			console.log(`Audio saved to ${filename}`);
		}
	});
}

function getBuffersFromfiles(listOfFiles) {
	let listOfBuffers = [];

	listOfFiles.forEach((file) => {
		const filename = "audio-" + file.replace(/。/g, "") + ".wav";
		const filepath = path.join(__dirname, 'savedSounds', filename)
		console.log("filepath: ", filepath);
		if (fs.existsSync(filepath)) {
			const buffer = fs.readFileSync(filepath);
			listOfBuffers.push({ text: file, audioData: buffer });
		}
	});

	return listOfBuffers;
}

app.post('/synthesize', (req, res) => {
	let text = req.body.text;
	console.log("text: ", text);

	let listOfOldBuffers = getBuffersFromfiles(text);
	listOfOldBuffers.map((buffer) => { text = text.filter((t) => t !== buffer.text) });

	if (text.length === 0) {
		console.log("No new text to synthesize");

		res.set({
			'Content-Type': 'audio/wav',
			'Content-Length': listOfOldBuffers.length
		});

		res.send(listOfOldBuffers);
		return;
	}

	const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
	const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

	console.log("Synthesizing speech...", text);
	const getAudio = async () => {
		let listOfAudio = [];
		for (let i = 0; i < text.length; i++) {
			console.log(`Synthesizing speech for text: ${text[i]}`);
			try {
				const result = await new Promise((resolve, reject) => {
					synthesizer.speakTextAsync(
						text[i], // Assuming you want to synthesize each text in the array
						(result) => {
							if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
								console.log(`Speech synthesized for text: ${text[i]}`);
								const audioData = result.audioData; // <Buffer ...>

								saveAudioToFile(audioData, `audio-${text[i]}.wav`);
								listOfAudio.push({ text: text[i], audioData: audioData });

								resolve(result);
							} else if (result.reason === sdk.ResultReason.Canceled) {
								const cancellation = sdk.CancellationDetails.fromResult(result);
								console.error("Speech Synthesis Canceled:", cancellation.reason);
								if (cancellation.reason === sdk.CancellationReason.Error) {
									console.error("Error details:", cancellation.errorDetails);
								}
								reject(new Error("Synthesis canceled. Check your logs for details."));
							}
						},
						(err) => {
							console.error("Error during synthesis:", err);
							reject(err);
						}
					);
				});
			} catch (error) {
				console.error("Error during synthesis:", error);
				throw error; // Re-throw the error to handle it in the calling function
			}
		}

		synthesizer.close(); // Close the synthesizer after all text has been processed

		return listOfAudio;
	};

	getAudio()
		.then((data) => {
			let listOfBuffers = [];
			data.forEach((ArrayBuffer) => {
				listOfBuffers.push({ text: ArrayBuffer.text, audioData: Buffer.from(ArrayBuffer.audioData) });
			});

			// add the old audio to the new audio list of buffers
			//listOfBuffers = listOfBuffers.concat(listOfOldBuffers);
			listOfOldBuffers = listOfOldBuffers.concat(listOfBuffers);

			res.set({
				'Content-Type': 'audio/wav',
				'Content-Length': listOfBuffers.length
			});
			res.send(listOfOldBuffers);
		})
		.catch((error) => {
			console.error("Error in getAudio:", error);
			res.status(500).send("Error during speech synthesis.");
		});

});

// 6. Start the server
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});

