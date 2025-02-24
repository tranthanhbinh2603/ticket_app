import mongoose from "mongoose";
import { OrderCancelledListener } from "../event/listener/order-cancelled-listener";
import { natsWrapper } from "../event/nats-wrapper";
import { Order } from "../model/order";
import {
	OrderCancelledEvent,
	OrderStatus,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const orderToCancel = Order.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		userID: new mongoose.Types.ObjectId().toHexString(),
		priceTicket: 50,
	});

	const orderCompleted = Order.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Complete,
		userID: new mongoose.Types.ObjectId().toHexString(),
		priceTicket: 100,
	});

	await orderToCancel.save();
	await orderCompleted.save();

	const dataOrderToCancelled: OrderCancelledEvent["data"] = {
		id: orderToCancel.id,
	};

	const dataOrderCompleted: OrderCancelledEvent["data"] = {
		id: orderCompleted.id,
	};

	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, dataOrderCompleted, dataOrderToCancelled, msg };
};

it("ORDER CANCELLED LISTENER: Cancelled created order but not payment (expired order)", async () => {
	const { listener, dataOrderToCancelled, msg } = await setup();
	await listener.onMessage(dataOrderToCancelled, msg);
	const orderToCancel = await Order.findById(dataOrderToCancelled.id);
	expect(orderToCancel).toBeDefined();
	expect(orderToCancel.status).toBe(OrderStatus.Cancelled);
});

it("ORDER CANCELLED LISTENER: Cancelled created order but its completed", async () => {
	const { listener, dataOrderCompleted, msg } = await setup();
	await listener.onMessage(dataOrderCompleted, msg);
	const orderCompleted = await Order.findById(dataOrderCompleted.id);
	expect(orderCompleted).toBeDefined();
	expect(orderCompleted.status).toBe(OrderStatus.Complete);
});
