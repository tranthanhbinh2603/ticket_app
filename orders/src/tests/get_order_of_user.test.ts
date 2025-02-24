import { app } from "../app";
import request from "supertest";
import { Ticket } from "../models/ticket";
import mongoose from "mongoose";

it("GET ORDER WITH USER: Get order when not logged user", async () => {
	const response = await request(app).get(`/api/orders/`);
	expect(response.status).toBe(401);
	const responseBody = JSON.parse(response.text);
	expect(responseBody).toHaveProperty("errors");
	expect(responseBody.errors).toBeInstanceOf(Array);
	expect(responseBody.errors.length).toBe(1);
	expect(responseBody.errors[0]).toHaveProperty("msg");
	expect(responseBody.errors[0].msg).toBe("You are not logged in.");
});

it("GET ORDER WITH USER: Should retrieve orders for a logged-in user successfully", async () => {
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

	let response = await request(app)
		.get(`/api/orders/`)
		.set("Cookie", global.signInUserOne());
	expect(response.status).toBe(200);
	let responseBody = JSON.parse(response.text);
	expect(responseBody).toBeInstanceOf(Array);
	expect(responseBody.length).toBe(1);
	expect(responseBody[0].ticket.id).toBe(newFirstTicketData._id.toString());

	response = await request(app)
		.get(`/api/orders/`)
		.set("Cookie", global.signInUserTwo());
	expect(response.status).toBe(200);
	responseBody = JSON.parse(response.text);
	expect(responseBody).toBeInstanceOf(Array);
	expect(responseBody.length).toBe(2);
	expect(responseBody[0].ticket.id).toBe(newSecondTicketData._id.toString());
	expect(responseBody[1].ticket.id).toBe(newThirdTicketData._id.toString());
});
