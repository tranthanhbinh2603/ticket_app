import { app } from "../app";
import request from "supertest";
import { Ticket } from "../model/ticket";
import { natsWrapper } from "../events/nats-wrapper";

it("DELETE TICKET: Delete ticket when logged", async () => {
	await global.generateTicket();
	let ticketDB = await Ticket.find({});
	const idEdit = ticketDB.filter((item) => item.title === "2")[0]._id;
	const response = await request(app)
		.delete(`/api/tickets`)
		.send({
			ticketID: idEdit,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(200);
	expect(response.body.msg).toBeDefined();
	expect(response.body.msg).toBe("successful");
	ticketDB = await Ticket.find({});
	const itemAfterDelete = ticketDB.filter(
		(item) => item.title === "This is first ticket"
	);
	expect(itemAfterDelete.length).toBe(0);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("DELETE TICKET: Delete ticket when not logged", async () => {
	await global.generateTicket();
	let ticketDB = await Ticket.find({});
	const idEdit = ticketDB.filter((item) => item.title === "2")[0]._id;
	const response = await request(app).delete(`/api/tickets/`).send({
		ticketID: idEdit,
	});
	expect(response.status).toBe(401);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("DELETE TICKET: Delete ticket when the author not login", async () => {
	await global.generateTicket();
	let ticketDB = await Ticket.find({});
	const idEdit = ticketDB.filter((item) => item.title === "4")[0]._id;
	const response = await request(app)
		.delete(`/api/tickets`)
		.send({
			ticketID: idEdit,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(401);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("DELETE TICKET: When missed ticketID", async () => {
	const response = await request(app)
		.delete(`/api/tickets`)
		.send({})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(response.body).toHaveProperty("errors");
	expect(response.body.errors).toBeInstanceOf(Array);
	expect(response.body.errors.length).toBe(2);
	expect(response.body.errors[0]).toHaveProperty("msg");
	expect(response.body.errors[0].msg).toBe("ticketID is not empty");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("DELETE TICKET: When pass ticketID is not valid mongoose id", async () => {
	const response = await request(app)
		.delete(`/api/tickets`)
		.send({
			ticketID: "72727272828",
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(400);
	expect(response.body).toHaveProperty("errors");
	expect(response.body.errors).toBeInstanceOf(Array);
	expect(response.body.errors.length).toBe(1);
	expect(response.body.errors[0]).toHaveProperty("msg");
	expect(response.body.errors[0].msg).toBe("ticketID is not valid");
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});
