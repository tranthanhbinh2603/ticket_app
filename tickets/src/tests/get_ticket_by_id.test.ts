import { app } from "../app";
import request from "supertest";
import { Ticket } from "../model/ticket";

it("GET TICKET BY ID: Get ticket by id when logged with id valid", async () => {
	await request(app)
		.post(`/api/tickets/`)
		.send({
			title: "This is first ticket",
			price: 2.0,
		})
		.set("Cookie", global.signin());
	const ticketDB = (await Ticket.find({}))[0];
	const response = await request(app).get(`/api/tickets/${ticketDB.id}`);
	expect(response.status).toBe(200);
	expect(response.body.ticket_data).toBeDefined();
	expect(response.body.ticket_data.title).toBeDefined();
	expect(response.body.ticket_data.title).toBe("This is first ticket");
	expect(response.body.ticket_data.price).toBeDefined();
	expect(response.body.ticket_data.price).toBe(2);
	expect(response.body.ticket_data.userId).toBeDefined();
	expect(response.body.ticket_data.userId).toBe("1lk24j124l");
});

it("GET TICKET BY ID: Get ticket by id when logged with id not valid", async () => {
	await request(app)
		.post(`/api/tickets/`)
		.send({
			title: "This is first ticket",
			price: 2.0,
		})
		.set("Cookie", global.signin());
	const ticketDB = (await Ticket.find({}))[0];
	const response = await request(app).get(
		`/api/tickets/${ticketDB.id + "1020"}`
	);
	expect(response.status).toBe(404);
	expect(response.body.errors).toBeDefined();
	expect(response.body.errors.length).toBe(1);
	expect(response.body.errors[0].msg).toBe("Not Found");
});

it("GET TICKET BY ID: Get ticket by id when not logged with id valid", async () => {
	//Yêu cầu: Vẫn cho hiện nếu người dùng chưa đăng nhập
});

it("GET TICKET BY ID: Get ticket by id when not logged with id not valid", async () => {
	//Yêu cầu: Vẫn cho hiện nếu người dùng chưa đăng nhập
});
