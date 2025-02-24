import mongoose from "mongoose";
import { app } from "../app";
import { natsWrapper } from "../events/nats-wrapper";
import { Ticket } from "../models/ticket";
import request from "supertest";

it("CANCEL ORDER: When user not login", async () => {
	const ticketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "For testing",
	});
	await ticketData.save();
	await request(app)
		.post("/api/orders")
		.send({
			ticketID: ticketData._id,
		})
		.set("Cookie", global.signInUserOne());
	const orderData = await request(app)
		.get("/api/orders")
		.set("Cookie", global.signInUserOne());
	const cancelOrderRequest = await request(app).delete("/api/orders").send({
		orderID: orderData.body[0].id,
	});
	expect(cancelOrderRequest.status).toBe(401);
	expect(cancelOrderRequest.body).toHaveProperty("errors");
	expect(cancelOrderRequest.body.errors).toBeInstanceOf(Array);
	expect(cancelOrderRequest.body.errors.length).toBe(1);
	expect(cancelOrderRequest.body.errors[0]).toHaveProperty("msg");
	expect(cancelOrderRequest.body.errors[0].msg).toBe("You are not logged in.");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CANCEL ORDER: When pass wrong orderID not object mongoose id valid", async () => {
	const ticketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "For testing",
	});
	await ticketData.save();
	await request(app)
		.post("/api/orders")
		.send({
			ticketID: ticketData._id,
		})
		.set("Cookie", global.signInUserOne());
	const cancelOrderRequest = await request(app)
		.delete("/api/orders")
		.send({
			orderID: "679f46cef818fc26630108b757",
		})
		.set("Cookie", global.signInUserOne());
	expect(cancelOrderRequest.status).toBe(400);
	expect(cancelOrderRequest.body).toHaveProperty("errors");
	expect(cancelOrderRequest.body.errors).toBeInstanceOf(Array);
	expect(cancelOrderRequest.body.errors.length).toBe(1);
	expect(cancelOrderRequest.body.errors[0]).toHaveProperty("msg");
	expect(cancelOrderRequest.body.errors[0].msg).toBe("orderID is not valid");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CANCEL ORDER: When miss orderID", async () => {
	const ticketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "For testing",
	});
	await ticketData.save();
	await request(app)
		.post("/api/orders")
		.send({
			ticketID: ticketData._id,
		})
		.set("Cookie", global.signInUserOne());
	const cancelOrderRequest = await request(app)
		.delete("/api/orders")
		.send({})
		.set("Cookie", global.signInUserOne());
	expect(cancelOrderRequest.status).toBe(400);
	expect(cancelOrderRequest.body).toHaveProperty("errors");
	expect(cancelOrderRequest.body.errors).toBeInstanceOf(Array);
	expect(cancelOrderRequest.body.errors.length).toBe(2);
	expect(cancelOrderRequest.body.errors[0]).toHaveProperty("msg");
	expect(cancelOrderRequest.body.errors[0].msg).toBe("orderID is not empty");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CANCEL ORDER: When orderID not in database", async () => {
	const ticketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "For testing",
	});
	await ticketData.save();
	await request(app)
		.post("/api/orders")
		.send({
			ticketID: ticketData._id,
		})
		.set("Cookie", global.signInUserOne());
	const cancelOrderRequest = await request(app)
		.delete("/api/orders")
		.send({
			orderID: "679f46cef3fc26630108b757",
		})
		.set("Cookie", global.signInUserOne());
	expect(cancelOrderRequest.status).toBe(404);
	expect(cancelOrderRequest.body).toHaveProperty("errors");
	expect(cancelOrderRequest.body.errors).toBeInstanceOf(Array);
	expect(cancelOrderRequest.body.errors.length).toBe(1);
	expect(cancelOrderRequest.body.errors[0]).toHaveProperty("msg");
	expect(cancelOrderRequest.body.errors[0].msg).toBe("Not Found");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CANCEL ORDER: When orderID is cancelled", async () => {
	const ticketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "For testing",
	});
	await ticketData.save();
	await request(app)
		.post("/api/orders")
		.send({
			ticketID: ticketData._id,
		})
		.set("Cookie", global.signInUserOne());
	const orderData = await request(app)
		.get("/api/orders")
		.set("Cookie", global.signInUserOne());
	let cancelOrderRequest = await request(app)
		.delete("/api/orders")
		.send({
			orderID: orderData.body[0].id,
		})
		.set("Cookie", global.signInUserOne());
	cancelOrderRequest = await request(app)
		.delete("/api/orders")
		.send({
			orderID: orderData.body[0].id,
		})
		.set("Cookie", global.signInUserOne());
	expect(cancelOrderRequest.status).toBe(500);
	expect(cancelOrderRequest.body).toHaveProperty("errors");
	expect(cancelOrderRequest.body.errors).toBeInstanceOf(Array);
	expect(cancelOrderRequest.body.errors.length).toBe(1);
	expect(cancelOrderRequest.body.errors[0]).toHaveProperty("msg");
	expect(cancelOrderRequest.body.errors[0].msg).toBe(
		"Order is already cancelled"
	);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it("CANCEL ORDER: Cancel successful", async () => {
	const ticketData = new Ticket({
		_id: new mongoose.Types.ObjectId(),
		price: 50,
		title: "For testing",
	});
	await ticketData.save();
	await request(app)
		.post("/api/orders")
		.send({
			ticketID: ticketData._id,
		})
		.set("Cookie", global.signInUserOne());
	const orderData = await request(app)
		.get("/api/orders")
		.set("Cookie", global.signInUserOne());
	const cancelOrderRequest = await request(app)
		.delete("/api/orders")
		.send({
			orderID: orderData.body[0].id,
		})
		.set("Cookie", global.signInUserOne());
	expect(cancelOrderRequest.statusCode).toBe(200);
	expect(cancelOrderRequest.body.msg).toBe("Successful");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
