require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({
	origin: ['http://localhost:3000', 'https://example.com'], // only allow these domains
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

		file = file.replace(/。/g, "");
		const fileName = "audio-" + file + ".wav";
		const filePath = path.join(__dirname, 'savedSounds', fileName);

		if (fs.existsSync(filePath)) {
			const buffer = fs.readFileSync(filePath);
			listOfBuffers.push(buffer);
		}
	});

	return listOfBuffers;
}









app.post('/synthesize', (req, res) => {
	console.log(req.body.text);

	const text = req.body.text;
	const listOfOldBuffers = getBuffersFromfiles(text);

	if (listOfOldBuffers.length != 0) {
		res.set({
			'Content-Type': 'audio/wav',
			'Content-Length': listOfOldBuffers.length
		});

		res.send(listOfOldBuffers);
		return;
	}

	// Create an audio configuration that points to an (in-memory) file


	const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
	const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

	//const getAudio = async () => {
	//	let listOfAudio = [];
	//	for (let i = 0; i < text.length; i++) {
	//		try {
	//			const result = await new Promise((resolve, reject) => {
	//				synthesizer.speakTextAsync(
	//					text[i], // Assuming you want to synthesize each text in the array
	//					(result) => {
	//						if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
	//							console.log(`Speech synthesized for text: ${text[i]}`);
	//							const audioData = result.audioData; // <Buffer ...>
	//							listOfAudio.push(audioData);
	//							console.log(audioData, `audio-${text[i]}.wav`);
	//							saveAudioToFile(audioData, `audio-${text[i]}.wav`);
	//							resolve(result);
	//						} else if (result.reason === sdk.ResultReason.Canceled) {
	//							const cancellation = sdk.CancellationDetails.fromResult(result);
	//							console.error("Speech Synthesis Canceled:", cancellation.reason);
	//							if (cancellation.reason === sdk.CancellationReason.Error) {
	//								console.error("Error details:", cancellation.errorDetails);
	//							}
	//							reject(new Error("Synthesis canceled. Check your logs for details."));
	//						}
	//					},
	//					(err) => {
	//						console.error("Error during synthesis:", err);
	//						reject(err);
	//					}
	//				);
	//			});
	//		} catch (error) {
	//			console.error("Error during synthesis:", error);
	//			throw error; // Re-throw the error to handle it in the calling function
	//		}
	//	}

	//	synthesizer.close(); // Close the synthesizer after all text has been processed
	//	return listOfAudio;
	//};

	//getAudio()
	//	.then((data) => {

	//		res.set({
	//			'Content-Type': 'audio/wav',
	//			'Content-Length': data.length
	//		});

	//		res.send(data);
	//	})
	//	.catch((error) => {
	//		console.error("Error in getAudio:", error);
	//		res.status(500).send("Error during speech synthesis.");
	//	});

});

// 6. Start the server
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});

