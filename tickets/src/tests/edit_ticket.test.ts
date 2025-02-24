import { app } from "../app";
import request from "supertest";
import { Ticket } from "../model/ticket";
import { natsWrapper } from "../events/nats-wrapper";

it("EDIT TICKET: Edit ticket when logged", async () => {
	await global.generateTicket();
	let ticketDB = await Ticket.find({});
	const idEdit = ticketDB.filter((item) => item.title === "2")[0]._id;
	const response = await request(app)
		.put(`/api/tickets/${idEdit}`)
		.send({
			title: "This is first ticket",
			price: 2.0,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(200);
	expect(response.body.msg).toBeDefined();
	expect(response.body.msg).toBe("successful");
	expect(response.body.ticket_data).toBeDefined();
	ticketDB = await Ticket.find({});
	const itemEdit = ticketDB.filter(
		(item) => item.title === "This is first ticket"
	)[0];
	expect(itemEdit.title).toBe("This is first ticket");
	expect(itemEdit.price).toBe(2);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});

it("EDIT TICKET: Edit ticket when not logged", async () => {
	await global.generateTicket();
	let ticketDB = await Ticket.find({});
	const idEdit = ticketDB.filter((item) => item.title === "2")[0]._id;
	const response = await request(app).put(`/api/tickets/${idEdit}`).send({
		title: "This is first ticket",
		price: 2.0,
	});
	expect(response.status).toBe(401);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});

it("EDIT TICKET: Edit ticket when the author not login", async () => {
	await global.generateTicket();
	let ticketDB = await Ticket.find({});
	const idEdit = ticketDB.filter((item) => item.title === "4")[0]._id;
	const response = await request(app)
		.put(`/api/tickets/${idEdit}`)
		.send({
			title: "This is first ticket",
			price: 2.0,
		})
		.set("Cookie", global.signin());
	expect(response.status).toBe(401);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});
