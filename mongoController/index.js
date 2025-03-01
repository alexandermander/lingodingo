const express = require('express')
const { connectMongo, client, userSchema } = require('./src/mordel/connectMongo');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
// use cors

// how to use set cookie in express

connectMongo();

const db = client.db("lingodingo");

const app = express()
app.use(express.json());

app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}));


const port = 3002

app.post('/singup', async (req, res) => {
	const user = { name: req.body.name, password: req.body.password };
	const collection = db.collection("users");
	const result = await collection.insertOne(user);
	console.log(result);
	res.send(result);
})

app.post('/login', async (req, res) => {
	console.log(req.body);
	const user = { name: req.body.name, password: req.body.password };
	const collection = db.collection("users");
	const result = await collection.findOne(user);

	if (!result) {
		res.send('user not found');
		return;
	}
	const token = uuidv4();
	await collection.updateOne(user, { $set: { token } });
	console.log(token, user);
	res.cookie('token', token, { httpOnly: true });
	res.send(result);
})

app.get('/users', async (req, res) => {
	const result = await collection.find({}).toArray();
	console.log(result);
	res.send(result);
})

app.get('/getdashboard', async (req, res) => {
	console.log(req.rawHeaders);
	const token = req.rawHeaders.find(header => header.includes('token'));
	const currentToken = token.split('=')[1];
	const uesrCollection = db.collection("users");
	const user = await uesrCollection.findOne({ token: currentToken });
	if (!user) {
		res.send('user not found');
		return;
	}
	const collection = db.collection("trainings");
	const trainings = await collection.find({ userId: user._id }).toArray();
	const listOftarinings = trainings.map(training => {
		return { character: training.character, lerningPoints: training.lerningPoints, lvl: training.lvl }
	})

	res.send(JSON.stringify(listOftarinings));
});

app.post("/getTraining", async (req, res) => {
	const token = req.rawHeaders[req.rawHeaders.length - 1];
	const allCharacters = req.body.getAlleBrakeDown;

	console.log(allCharacters);

	const currentToken = token.split('=')[1];
	const uesrCollection = db.collection("users");
	const user = await uesrCollection.findOne({ token: currentToken });
	if (!user) {
		res.send('user not found');
		return;
	}
	const collection = db.collection("trainings");
	const trainings = await collection.find({ userId: user._id }).toArray();

	// find all characters that are 0 in lerningPoints that the user has 
	const result = allCharacters.filter(character => { // fi
		const existingTraining = trainings.find(training => training.character === character);
		if (existingTraining) {
			return existingTraining.lerningPoints === 0;
		}
		return false;
	})
	res.send(JSON.stringify(result));
})

app.post('/setTraining', async (req, res) => {
	const token = req.rawHeaders[req.rawHeaders.length - 1];
	const currentToken = token.split('=')[1];
	const uesrCollection = db.collection("users");
	const user = await uesrCollection.findOne({ token: currentToken });
	if (!user) {
		res.send('user not found');
		return;
	}

	const collection = db.collection("trainings");
	const { lerningPoints, character } = req.body;

	const existingTraining = await collection.findOne({
		character: character,
		userId: user._id
	});

	if (existingTraining) {
		await collection.updateOne({ character, userId: user._id }, { $inc: { lerningPoints: lerningPoints } });
	}
	else {
		await collection.insertOne({ character, "lerningPoints": 5, userId: user._id });
	}
	res.send(JSON.stringify("ok"));
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
