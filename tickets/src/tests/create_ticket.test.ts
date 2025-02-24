import request from "supertest";
import { app } from "../app";
import { Ticket } from "../model/ticket";
import { natsWrapper } from "../events/nats-wrapper";

it("CREATE TICKET: Create ticket when logged (and fill valid all field)", async () => {
	let ticketDBCount = (await Ticket.find({})).length;
	expect(ticketDBCount).toBe(0);
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({
			title: "This is first ticket",
			price: 2.0,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(201);
	ticketDBCount = (await Ticket.find({})).length;
	expect(ticketDBCount).toBe(1);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CREATE TICKET: Create ticket when not logged", async () => {
	const response = await request(app).post(`/api/tickets/`).send({
		title: "This is first ticket",
		price: 2.0,
	});
	expect(response.status).toBe(401);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE TICKET: Create ticket when missed title", async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({
			price: 2.0,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE TICKET: Create ticket when missed price", async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({
			title: "This is first ticket",
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE TICKET: Create ticket when missed title and price", async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE TICKET: Create ticket when not valid title", async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({
			title:
				"This is first ticket, i think it is too long to test because i like it",
			price: 2.0,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE TICKET: Create ticket when not price is not float", async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({
			title: "This is first ticket",
			price: 2,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(201);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("CREATE TICKET: Create ticket when not price is negative", async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({
			title: "This is first ticket",
			price: -1.882,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("CREATE TICKET: Create ticket when not valid title and price", async () => {
	const response = await request(app)
		.post(`/api/tickets/`)
		.send({
			title:
				"This is first ticket, i think it too long long long long long long long",
			price: -100000,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});
