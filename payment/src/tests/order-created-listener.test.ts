import mongoose from "mongoose";
import { OrderCreatedListener } from "../event/listener/order-created-listener";
import { natsWrapper } from "../event/nats-wrapper";
import { Order } from "../model/order";
import {
	OrderCreatedEvent,
	OrderStatus,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const dataEvent: OrderCreatedEvent["data"] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
			price: 50,
			title: "For test",
		},
	};

	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, dataEvent, msg };
};

it("ORDER CREATED LISTENER: Have change orderID if ticket is ordered", async () => {
	const { listener, dataEvent, msg } = await setup();

	await listener.onMessage(dataEvent, msg);

	const allOrder = await Order.find({});

	expect(allOrder.length).toBe(1);
	expect(allOrder[0].id).toBe(dataEvent.id);
	expect(allOrder[0].priceTicket).toBe(dataEvent.ticket.price);
	expect(allOrder[0].status).toBe(dataEvent.status);
});

it("ORDER CREATED LISTENER: Check ack", async () => {
	const { listener, dataEvent, msg } = await setup();

	await listener.onMessage(dataEvent, msg);

	expect(msg.ack).toHaveBeenCalledTimes(1);
});
