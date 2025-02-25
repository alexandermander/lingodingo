// uuid generate a unique id for each user
const { v4: uuidv4 } = require('uuid');

const userSining = async (req, res) => {
	const user = { name: req.body.name, password: req.body.password };
	const result = await collection.insertOne(user);
	console.log(result);
	res.send(result);
}

const login = async (req, res) => {
	const user = { name: req.body.name, password: req.body.password };
	const result = await collection.findOne(user);
	if (!result) {
		res.send('user not found');
		return;
	}

	const token = uuidv4();
	await collection.updateOne(user, { $set: { token } });

	console.log(result);
	res.send(result);
}

module.exports = { userSining, login }
