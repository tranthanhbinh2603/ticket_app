import mongoose from "mongoose";
import { ExpirationCompleteListener } from "../events/listener/expiration-complete-listener";
import { natsWrapper } from "../events/nats-wrapper";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderStatus } from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticketToOrderIfCreated = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		title: "For test 1",
		price: 30,
	});

	const ticketToOrderIfCompleted = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		title: "For test 1",
		price: 30,
	});

	const ticketToOrderIfCanceled = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		title: "For test 1",
		price: 30,
	});

	const orderIsCreated = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketToOrderIfCreated.id,
	});

	const orderIsCompleted = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Complete,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketToOrderIfCompleted.id,
	});

	const orderIsCancelled = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Cancelled,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketToOrderIfCanceled.id,
	});

	await ticketToOrderIfCreated.save();
	await ticketToOrderIfCompleted.save();
	await ticketToOrderIfCanceled.save();
	await orderIsCreated.save();
	await orderIsCompleted.save();
	await orderIsCancelled.save();

	const dataEventIfCreated: ExpirationCompleteListener["data"] = {
		orderID: orderIsCreated.id,
	};

	const dataEventTicketIDWrong: ExpirationCompleteListener["data"] = {
		orderID: new mongoose.Types.ObjectId().toHexString(),
	};

	const dataEventIfCancelled: ExpirationCompleteListener["data"] = {
		orderID: orderIsCancelled.id,
	};

	const dataEventIfCompleted: ExpirationCompleteListener["data"] = {
		orderID: orderIsCompleted.id,
	};

	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	return {
		listener,
		dataEventIfCreated,
		dataEventTicketIDWrong,
		dataEventIfCancelled,
		dataEventIfCompleted,
		msg,
	};
};

it("Make a cancellation if the order is currently booked", async () => {
	const { listener, dataEventIfCreated, msg } = await setup();

	await listener.onMessage(dataEventIfCreated, msg);

	const orderTarget = await Order.findById(dataEventIfCreated.orderID);
	expect(orderTarget.status).toBeDefined();
	expect(orderTarget.status).toBe(OrderStatus.Cancelled);
});

it("Cancellation attempt made but ticket code does not exist", async () => {
	const { listener, dataEventIfCreated, dataEventTicketIDWrong, msg } =
		await setup();

	await listener.onMessage(dataEventTicketIDWrong, msg);

	const orderTarget = await Order.findById(dataEventIfCreated.orderID);
	expect(orderTarget.status).toBeDefined();
	expect(orderTarget.status).toBe(OrderStatus.Created);
});

it("Tried to cancel the order but it was already canceled", async () => {
	const { listener, dataEventIfCancelled, msg } = await setup();

	await listener.onMessage(dataEventIfCancelled, msg);

	const orderTarget = await Order.findById(dataEventIfCancelled.orderID);
	expect(orderTarget.status).toBeDefined();
	expect(orderTarget.status).toBe(OrderStatus.Cancelled);
});

it("Tried to cancel the order but it was already complete", async () => {
	const { listener, dataEventIfCompleted, msg } = await setup();

	await listener.onMessage(dataEventIfCompleted, msg);

	const orderTarget = await Order.findById(dataEventIfCompleted.orderID);
	expect(orderTarget.status).toBeDefined();
	expect(orderTarget.status).toBe(OrderStatus.Complete);
});
