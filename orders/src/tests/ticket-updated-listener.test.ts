import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../events/nats-wrapper";
import { TicketUpdatedEvent } from "@tranthanhbinh2603/ticket_app_library";
import { TicketUpdatedListener } from "../events/listener/ticket-updated-listener";

const setup = async () => {
	//Tạo 1 ticket mỡi
	const ticket = Ticket.build({
		_id: new mongoose.Types.ObjectId().toString(),
		price: 50,
		title: "Ticket for test",
	});
	await ticket.save();

	//Tạo ra đối tương listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	//Tạo ra event data để thực hiện việc update ticket
	const eventData: TicketUpdatedEvent["data"] = {
		id: ticket._id.toString(),
		version: ticket.version + 1,
		title: "Ticket for test (Edited)",
		orderId: new mongoose.Types.ObjectId().toHexString(),
		price: 20,
	};

	//Tạo ra đối tượng msg.ack()
	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, eventData, msg };
};

//Kiểm tra xem liệu sửa được ticket trong event không
it("TICKET UPDATED LISTENER: Edit ticket if ticket created", async () => {
	const { listener, eventData, msg } = await setup();

	await listener.onMessage(eventData, msg);

	const ticketTarget = await Ticket.findOne({
		_id: eventData.id,
	});
	expect(ticketTarget).toBeDefined();
	expect(ticketTarget.version).toBe(eventData.version);
	expect(ticketTarget.title).toBe(eventData.title);
	expect(ticketTarget.price).toBe(eventData.price);
	expect(ticketTarget.orderId.toString()).toBe(eventData.orderId);
});

//Kiểm tra xem liệu có chạy được tới cùng không
it("TICKET UPDATED LISTENER: Check ack call", async () => {
	const { listener, eventData, msg } = await setup();

	await listener.onMessage(eventData, msg);

	expect(msg.ack).toHaveBeenCalledTimes(1);
});

//Kiểm tra xem hệ thống có bỏ qua việc có cập nhật nhiều hơn so với hiện tại không
it("TICKET UPDATED LISTENER: Check ack not call", async () => {
	const { listener, eventData, msg } = await setup();
	eventData.version += 100;

	await listener.onMessage(eventData, msg);

	const ticketTarget = await Ticket.findOne({
		_id: eventData.id,
	});
	expect(ticketTarget).toBeDefined();
	expect(ticketTarget.version).toBe(0);
	expect(ticketTarget.title).toBe("Ticket for test");
	expect(ticketTarget.price).toBe(50);
	expect(ticketTarget.orderId).not.toBeDefined();
	expect(msg.ack).toHaveBeenCalledTimes(0);
});
