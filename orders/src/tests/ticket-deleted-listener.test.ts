import { TicketDeletedListener } from "../events/listener/ticket-deleted-listener";
import { natsWrapper } from "../events/nats-wrapper";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";
import mongoose from "mongoose";
import {
	OrderStatus,
	TicketDeletedEvent,
} from "@tranthanhbinh2603/ticket_app_library";
import { Order } from "../models/order";

const setup = async () => {
	const listener = new TicketDeletedListener(natsWrapper.client);

	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	const ticketToDeleted = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		price: 500,
		title: "This is ticket deleted",
	});

	const ticketOrdering = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		price: 99999,
		title: "This is ticket ordering",
	});

	const orderData = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketOrdering,
	});
	ticketOrdering.set({ orderId: orderData.id });

	await ticketOrdering.save();
	await orderData.save();
	await ticketToDeleted.save();

	const dataEventValidDeleted: TicketDeletedEvent["data"] = {
		id: ticketToDeleted.id,
	};

	const dataEventNotValidDeleted: TicketDeletedEvent["data"] = {
		id: ticketOrdering.id,
	};

	return {
		listener,
		msg,
		ticketToDeleted,
		ticketOrdering,
		dataEventValidDeleted,
		dataEventNotValidDeleted,
	};
};

it("TICKET DELETE LISTENER: If ticket valid", async () => {
	const { listener, msg, dataEventValidDeleted } = await setup();
	await listener.onMessage(dataEventValidDeleted, msg);
	const countTicket = await Ticket.countDocuments();
	expect(countTicket).toBe(1);
	expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("TICKET DELETE LISTENER: If ticket not valid", async () => {
	const { listener, msg, dataEventNotValidDeleted } = await setup();
	await listener.onMessage(dataEventNotValidDeleted, msg);
	const countTicket = await Ticket.countDocuments();
	expect(msg.ack).toHaveBeenCalledTimes(0);
	expect(countTicket).toBe(2);
});
