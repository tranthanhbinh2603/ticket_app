import request from "supertest";
import { app } from "../app";

it("GET TICKETS: Get all tickets when logged", async () => {
	await global.generateTicket();
	const response = await request(app)
		.get(`/api/tickets/`)
		.set("Cookie", global.signin());
	expect(response.status).toBe(200);
	expect(response.body.ticket_data).toBeDefined();
	expect(response.body.ticket_data.length).toBe(5);
	response.body.ticket_data.forEach((ticket) => {
		expect(ticket).toHaveProperty("title");
		expect(typeof ticket.title).toBe("string");
		expect(ticket).toHaveProperty("price");
		expect(typeof ticket.price).toBe("number");
		expect(ticket).toHaveProperty("userId");
		expect(typeof ticket.userId).toBe("string");
	});
});

it("GET TICKETS: Get all tickets when not logged", async () => {
	await global.generateTicket();
	const response = await request(app).get(`/api/tickets/`);
	expect(response.status).toBe(200);
	expect(response.body.ticket_data).toBeDefined();
	expect(response.body.ticket_data.length).toBe(5);
	response.body.ticket_data.forEach((ticket) => {
		expect(ticket).toHaveProperty("title");
		expect(typeof ticket.title).toBe("string");
		expect(ticket).toHaveProperty("price");
		expect(typeof ticket.price).toBe("number");
		expect(ticket).toHaveProperty("userId");
		expect(typeof ticket.userId).toBe("string");
	});
});
