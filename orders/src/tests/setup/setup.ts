import mongoose from "mongoose";
var jwt = require("jsonwebtoken");
import { MongoMemoryServer } from "mongodb-memory-server";

jest.mock("../../events/nats-wrapper");

let mongo: MongoMemoryServer;

beforeAll(async () => {
	process.env.JWT_KEY = "JWT_KEY_TESTING";
	process.env.ORDER_EXPIRY_DURATION_SECONDS = "900";
	process.env.NATS_URL = "http://nats-srv:4333";

	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
	if (mongoose.connection.db) {
		const collections = await mongoose.connection.db.collections();
		for (let collection of collections) {
			await collection.deleteMany({});
		}
	}
	jest.clearAllMocks();
});

afterAll(async () => {
	if (mongo) {
		await mongo.stop();
	}
	await mongoose.connection.close();
});

global.signInUserOne = () => {
	const payload = {
		id: "1lk24j124l",
		email: "test@test.com",
	};
	const expiresIn = "1800s";
	const jwtToken = jwt.sign(payload, process.env.JWT_KEY as string, {
		algorithm: "HS256",
		expiresIn,
	});
	const session = { jwt: jwtToken };
	const sessionJSON = JSON.stringify(session);
	const base64 = Buffer.from(sessionJSON).toString("base64");
	return `session=${base64}`;
};

global.signInUserTwo = () => {
	const payload = {
		id: "1lk24j124l83838",
		email: "test2@test.com",
	};
	const expiresIn = "1800s";
	const jwtToken = jwt.sign(payload, process.env.JWT_KEY as string, {
		algorithm: "HS256",
		expiresIn,
	});
	const session = { jwt: jwtToken };
	const sessionJSON = JSON.stringify(session);
	const base64 = Buffer.from(sessionJSON).toString("base64");
	return `session=${base64}`;
};
