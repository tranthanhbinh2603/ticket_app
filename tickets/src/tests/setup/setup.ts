import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Ticket } from "../../model/ticket";
import { MongoMemoryServer } from "mongodb-memory-server";

declare global {
	var signin: () => string;
	var generateTicket: () => Promise<void>;
}

jest.mock("../../events/nats-wrapper");

let mongo: MongoMemoryServer;

beforeAll(async () => {
	process.env.JWT_KEY = "test";
	process.env.NATS_CLUSTER_ID = "ticketing";
	process.env.NATS_URL = "http://nats-srv:4333";
	process.env.STRIPE_KEY = "sk_test_4eC39HqLyjWDarjtT1zdp7dc";

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

//Fake signin
global.signin = () => {
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

//Fake ticket
global.generateTicket = async () => {
	let tickets = [
		new Ticket({
			title: "2",
			price: 15,
			userId: "1lk24j124l",
		}),
		new Ticket({
			title: "3",
			price: 25,
			userId: "1lk24j124l",
		}),
		new Ticket({
			title: "4",
			price: 35,
			userId: uuidv4().replace(/-/g, "").slice(0, 10),
		}),
		new Ticket({
			title: "5",
			price: 45,
			userId: uuidv4().replace(/-/g, "").slice(0, 10),
		}),
		new Ticket({
			title: "6",
			price: 55,
			userId: uuidv4().replace(/-/g, "").slice(0, 10),
		}),
	];
	for (const ticket of tickets) {
		await ticket.save();
	}
};
