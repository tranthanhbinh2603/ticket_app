import mongoose from "mongoose";
var jwt = require("jsonwebtoken");
import { MongoMemoryServer } from "mongodb-memory-server";
import { Order } from "../../model/order";
import { OrderStatus } from "@tranthanhbinh2603/ticket_app_library";

jest.mock("../../event/nats-wrapper");
// jest.mock("../../library/stripe");

let mongo: MongoMemoryServer;

process.env.STRIPE_KEY =
	"sk_test_51Psh7pP0v32BBVPQC1fa7S88qORbu9ObwOPI0UTSzJx6ziNwxPJzJ6z3scvOswFYQ0thaKlLQjrMuiKxCCSFPeCg009CYT7ve7";

beforeAll(async () => {
	process.env.JWT_KEY = "test";
	process.env.NATS_CLUSTER_ID = "ticketing";
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

global.setup = async () => {
	const orderHavePayment = Order.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		userID: "1lk24j124l",
		priceTicket: 2000,
	});
	const orderCompleted = Order.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Complete,
		userID: "1lk24j124l",
		priceTicket: 200000,
	});
	const orderCancelled = Order.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Cancelled,
		userID: "1lk24j124l",
		priceTicket: 20000001,
	});
	await orderHavePayment.save();
	await orderCompleted.save();
	await orderCancelled.save();
};
