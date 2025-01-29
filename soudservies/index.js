require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const cors = require('cors');
const path = require('path');

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



//create a post endpoint





app.post('/synthesize', (req, res) => {
	console.log(req.body.text);

	let listOfAudio = [];

	const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
	const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

	// Start synthesis
	synthesizer.speakTextAsync(
		text,
		(result) => {
			if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
				console.log(`Speech synthesized for text: ${text}`);

				// If you only care about *playing* the audio (as above), you can just respond with a success message:
				// return res.send("Audio is synthesized and played on the server.");

				// If you want to return the raw WAV data to the client, do this instead:
				const audioData = result.audioData; // <Buffer ...>
				res.set({
					'Content-Type': 'audio/wav',
					'Content-Length': audioData.length,
				});
				return res.send(Buffer.from(audioData));

			} else if (result.reason === sdk.ResultReason.Canceled) {
				const cancellation = sdk.CancellationDetails.fromResult(result);
				console.error("Speech Synthesis Canceled:", cancellation.reason);
				if (cancellation.reason === sdk.CancellationReason.Error) {
					console.error("Error details:", cancellation.errorDetails);
				}
				return res.status(500).send("Synthesis canceled. Check your logs for details.");
			}

			// Close the synthesizer
			synthesizer.close();
		},
		(err) => {
			console.error("Error during synthesis:", err);
			synthesizer.close();
			res.status(500).send("Error during speech synthesis.");
		}
	);
});

// 6. Start the server
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});

