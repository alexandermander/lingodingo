const { MongoClient
} = require('mongodb');

const mongoose = require('mongoose');

const uri = "mongodb://admin:pass@localhost:27017/";
const client = new MongoClient(uri);

async function connectMongo() {
	try {
		await client.connect();
		console.log("Connected to MongoDB");
	} catch (err) {
		console.error(err);
	}
}
const userSchema = new mongoose.Schema({
	name: String,
	password: String
});

module.exports = { connectMongo, client, userSchema };
