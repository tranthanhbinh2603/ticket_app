import { app } from "../app";
import request from "supertest";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import mongoose from "mongoose";

async function initGetOrderByIDTest() {
	const newFirstTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 1,
		title: "First ticket",
	});
	const newSecondTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 2,
		title: "Second ticket",
	});
	const newThirdTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 3,
		title: "Third ticket",
	});
	await newFirstTicketData.save();
	await newSecondTicketData.save();
	await newThirdTicketData.save();

	await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: newFirstTicketData._id.toString(),
		})
		.set("Cookie", global.signInUserOne());
	await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: newSecondTicketData._id.toString(),
		})
		.set("Cookie", global.signInUserTwo());

	await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: newThirdTicketData._id.toString(),
		})
		.set("Cookie", global.signInUserTwo());
}

it("GET ORDER BY ID: When not logged", async () => {
	await initGetOrderByIDTest();
	const allOrderCurrent = await Order.find({});
	const response = await request(app).get(
		`/api/orders/${allOrderCurrent[0]._id.toString()}`
	);
	expect(response.status).toBe(401);
	const responseBody = JSON.parse(response.text);
	expect(responseBody).toHaveProperty("errors");
	expect(responseBody.errors).toBeInstanceOf(Array);
	expect(responseBody.errors.length).toBe(1);
	expect(responseBody.errors[0]).toHaveProperty("msg");
	expect(responseBody.errors[0].msg).toBe("You are not logged in.");
});

it("GET ORDER BY ID: Take order by id when user logs in with correct account", async () => {
	await initGetOrderByIDTest();
	const allOrderCurrent = await Order.find({});
	const response = await request(app)
		.get(`/api/orders/${allOrderCurrent[0]._id.toString()}`)
		.set("Cookie", global.signInUserOne());
	expect(response.status).toBe(200);
});

it("GET ORDER BY ID: Take order by id when user logs in with wrong account", async () => {
	await initGetOrderByIDTest();
	const allOrderCurrent = await Order.find({});
	const response = await request(app)
		.get(`/api/orders/${allOrderCurrent[0]._id.toString()}`)
		.set("Cookie", global.signInUserTwo());
	expect(response.status).toBe(404);
	const responseBody = JSON.parse(response.text);
	expect(responseBody).toHaveProperty("errors");
	expect(responseBody.errors).toBeInstanceOf(Array);
	expect(responseBody.errors.length).toBe(1);
	expect(responseBody.errors[0]).toHaveProperty("msg");
	expect(responseBody.errors[0].msg).toBe("Not Found");
});
