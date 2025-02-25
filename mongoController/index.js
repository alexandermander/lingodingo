const express = require('express')
const { connectMongo, client, userSchema } = require('./src/mordel/connectMongo');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
// use cors


// how to use set cookie in express
connectMongo();

const db = client.db("lingodingo");
const collection = db.collection("users");

const app = express()
app.use(express.json());

app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}));


const port = 3002

app.post('/singup', async (req, res) => {
	const user = { name: req.body.name, password: req.body.password };
	const result = await collection.insertOne(user);
	console.log(result);
	res.send(result);
})

app.post('/login', async (req, res) => {
	console.log(req.body);
	const user = { name: req.body.name, password: req.body.password };
	const result = await collection.findOne(user);
	if (!result) {
		res.send('user not found');
		return;
	}
	const token = uuidv4();
	await collection.updateOne(user, { $set: { token } });
	res.cookie('token', token);
	res.send(result);
})

app.get('/users', async (req, res) => {
	const result = await collection.find({}).toArray();
	console.log(result);
	res.send(result);
})


app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
