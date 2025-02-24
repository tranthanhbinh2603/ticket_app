import mongoose from "mongoose";
import { OrderCreatedListener } from "../events/listener/order-created-listener";
import { natsWrapper } from "../events/nats-wrapper";
import { Ticket } from "../model/ticket";
import {
	OrderCreatedEvent,
	OrderStatus,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const ticketHaveOrder = Ticket.build({
		title: "This is ticket have test",
		price: 0.99,
		userId: new mongoose.Types.ObjectId().toHexString(),
	});
	await ticketHaveOrder.save();

	const dataEvent: OrderCreatedEvent["data"] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		userID: ticketHaveOrder.userId,
		status: OrderStatus.Created,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: {
			id: ticketHaveOrder.id,
			price: ticketHaveOrder.price,
			title: ticketHaveOrder.title,
		},
	};

	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, ticketHaveOrder, dataEvent, msg };
};

it("ORDER CREATED LISTENER: Have change orderID if ticket is ordered", async () => {
	const { listener, dataEvent, ticketHaveOrder, msg } = await setup();

	await listener.onMessage(dataEvent, msg);

	const ticket = await Ticket.findById(ticketHaveOrder.id);

	expect(ticket.orderId).toBeDefined();
	expect(ticket.orderId).toBe(dataEvent.id);
});

it("ORDER CREATED LISTENER: Ack and publish called (and check orderID)", async () => {
	const { listener, dataEvent, msg } = await setup();

	await listener.onMessage(dataEvent, msg);

	expect(msg.ack).toHaveBeenCalledTimes(1);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);

	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(ticketUpdatedData.orderId).toBe(dataEvent.id);
});

it("ORDER CREATED LISTENER: Not update if wrong ticket orders", async () => {
	const { listener, dataEvent, ticketHaveOrder, msg } = await setup();
	dataEvent.ticket.id = new mongoose.Types.ObjectId().toHexString();

	await listener.onMessage(dataEvent, msg);

	const ticket = await Ticket.findById(ticketHaveOrder.id);

	expect(ticket.orderId).not.toBeDefined();
	expect(msg.ack).toHaveBeenCalledTimes(0);
	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0);
});
