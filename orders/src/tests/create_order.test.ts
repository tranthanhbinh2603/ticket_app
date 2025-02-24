import { app } from "../app";
import request from "supertest";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../events/nats-wrapper";
import mongoose from "mongoose";

it("CREATE ORDER: Create order when not logged", async () => {
	const response = await request(app).post(`/api/orders/`).send({
		title: "This is first ticket",
		price: 2.0,
	});
	expect(response.status).toBe(401);
	const responseBody = JSON.parse(response.text);
	expect(responseBody).toHaveProperty("errors");
	expect(responseBody.errors).toBeInstanceOf(Array);
	expect(responseBody.errors.length).toBe(1);
	expect(responseBody.errors[0]).toHaveProperty("msg");
	expect(responseBody.errors[0].msg).toBe("You are not logged in.");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE ORDER: Create order when ticket exists (Successful order)", async () => {
	const newTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "This is for test",
	});
	await newTicketData.save();
	const response = await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: newTicketData._id.toString(),
		})
		.set("Cookie", global.signInUserOne());
	expect(response.status).toBe(201);
	const responseBody = JSON.parse(response.text);
	expect(responseBody).toHaveProperty("msg");
	expect(responseBody.msg).toBe("Successful");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CREATE ORDER: Create order when ticket not found", async () => {
	const newTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "This is for test",
	});
	await newTicketData.save();
	const response = await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: "679f46cef3fc26630108b757",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.status).toBe(404);
	const responseBody = JSON.parse(response.text);
	expect(responseBody).toHaveProperty("errors");
	expect(responseBody.errors).toBeInstanceOf(Array);
	expect(responseBody.errors.length).toBe(1);
	expect(responseBody.errors[0]).toHaveProperty("msg");
	expect(responseBody.errors[0].msg).toBe("Not Found");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE ORDER: Create order when ticket ordered (Pending Payment - Created)", async () => {
	const newTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "This is for test (For two ticket overlap)",
	});
	await newTicketData.save();
	let response = await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: newTicketData._id.toString(),
		})
		.set("Cookie", global.signInUserOne());
	response = await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: newTicketData._id.toString(),
		})
		.set("Cookie", global.signInUserOne());
	expect(response.status).toBe(500);
	const responseBody = JSON.parse(response.text);
	expect(responseBody).toHaveProperty("errors");
	expect(responseBody.errors).toBeInstanceOf(Array);
	expect(responseBody.errors.length).toBe(1);
	expect(responseBody.errors[0]).toHaveProperty("msg");
	expect(responseBody.errors[0].msg).toBe("Ticket is already reserved");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CREATE ORDER: When miss ticket ID", async () => {
	const newTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "This is for test",
	});
	await newTicketData.save();
	const response = await request(app)
		.post(`/api/orders/`)
		.send({})
		.set("Cookie", global.signInUserOne());
	expect(response.status).toBe(400);
	expect(response.body).toHaveProperty("errors");
	expect(response.body.errors).toBeInstanceOf(Array);
	expect(response.body.errors.length).toBe(2);
	expect(response.body.errors[0]).toHaveProperty("msg");
	expect(response.body.errors[0].msg).toBe("ticketID is not empty");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE ORDER: When pass ticketID not mongoose id valid", async () => {
	const newTicketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "This is for test",
	});
	await newTicketData.save();
	const response = await request(app)
		.post(`/api/orders/`)
		.send({
			ticketID: "99292929283828292",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.status).toBe(400);
	expect(response.body).toHaveProperty("errors");
	expect(response.body.errors).toBeInstanceOf(Array);
	expect(response.body.errors.length).toBe(1);
	expect(response.body.errors[0]).toHaveProperty("msg");
	expect(response.body.errors[0].msg).toBe("ticketID is not valid");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});
