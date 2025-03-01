const { getDB } = require('./dbmodel');  // adjust path as necessary
const { v4: uuidv4 } = require('uuid');

const login = async (req, res) => {
	console.log(req.body);
	const user = { name: req.body.name, password: req.body.password };

	// Get the database instance from your module
	const db = getDB();
	const collection = db.collection("users");

	const result = await collection.findOne(user);
	if (!result) {
		res.send('user not found');
		return;
	}
	const token = uuidv4();
	await collection.updateOne(user, { $set: { token } });
	res.cookie('token', token, { httpOnly: true });
	res.send(result);
};

module.exports = { login };
