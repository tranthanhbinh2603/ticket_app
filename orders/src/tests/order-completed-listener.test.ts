import mongoose from "mongoose";
import { Order } from "../models/order";
import { OrderStatus } from "@tranthanhbinh2603/ticket_app_library";
import { Ticket } from "../models/ticket";
import { OrderCompletedListener } from "../events/listener/order-completed-listener";
import { natsWrapper } from "../events/nats-wrapper";
import { Message } from "node-nats-streaming";

const setup = async () => {
	const ticketOne = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		title: "For test 1",
		price: 50,
	});
	const ticketTwo = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		title: "For test 2",
		price: 60,
	});
	const ticketThree = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		title: "For test 3",
		price: 70,
	});
	const ticketFour = Ticket.build({
		_id: new mongoose.Types.ObjectId().toHexString(),
		title: "For test 4",
		price: 80,
	});
	await ticketOne.save();
	await ticketTwo.save();
	await ticketThree.save();
	await ticketFour.save();
	const orderCreated = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketOne,
	});
	const orderCancelled = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Cancelled,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketOne,
	});
	const orderAwaitPayment = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.AwaitingPayment,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketOne,
	});
	const orderCompleted = Order.build({
		userID: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Complete,
		expiredAt: new Date(new Date().setSeconds(new Date().getSeconds() + 900)),
		ticket: ticketOne,
	});
	await orderCreated.save();
	await orderAwaitPayment.save();
	await orderCompleted.save();
	await orderCancelled.save();

	const dataEventCreatedOrder: OrderCompletedListener["data"] = {
		id: orderCreated.id,
	};

	const dataEventCompletedOrder: OrderCompletedListener["data"] = {
		id: orderCompleted.id,
	};

	const dataEventAwaitPaymentOrder: OrderCompletedListener["data"] = {
		id: orderAwaitPayment.id,
	};

	const dataEventCancelledOrder: OrderCompletedListener["data"] = {
		id: orderCancelled.id,
	};

	const listener = new OrderCompletedListener(natsWrapper.client);

	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	return {
		dataEventCreatedOrder,
		dataEventAwaitPaymentOrder,
		dataEventCompletedOrder,
		dataEventCancelledOrder,
		listener,
		msg,
	};
};

it("ORDER COMPLETED LISTENER: If wrong ticket", async () => {
	const { listener, dataEventCreatedOrder, msg } = await setup();
	const originalID = dataEventCreatedOrder.id;
	dataEventCreatedOrder.id = "this_is_wrong_id";
	await listener.onMessage(dataEventCreatedOrder, msg);
	const order = await Order.findById(originalID);
	expect(order.status).toBe(OrderStatus.Created);
});

it("ORDER COMPLETED LISTENER: If ticket created", async () => {
	const { listener, dataEventCreatedOrder, msg } = await setup();
	await listener.onMessage(dataEventCreatedOrder, msg);
	const order = await Order.findById(dataEventCreatedOrder.id);
	expect(order.status).toBe(OrderStatus.Complete);
});

it("ORDER COMPLETED LISTENER: If ticket await payment", async () => {
	const { listener, dataEventAwaitPaymentOrder, msg } = await setup();
	await listener.onMessage(dataEventAwaitPaymentOrder, msg);
	const order = await Order.findById(dataEventAwaitPaymentOrder.id);
	expect(order.status).toBe(OrderStatus.Complete);
});

it("ORDER COMPLETED LISTENER: If ticket completed payment", async () => {
	const { listener, dataEventCompletedOrder, msg } = await setup();
	await listener.onMessage(dataEventCompletedOrder, msg);
	const order = await Order.findById(dataEventCompletedOrder.id);
	expect(order.status).toBe(OrderStatus.Complete);
});

it("ORDER COMPLETED LISTENER: If ticket cancelled", async () => {
	const { listener, dataEventCancelledOrder, msg } = await setup();
	await listener.onMessage(dataEventCancelledOrder, msg);
	const order = await Order.findById(dataEventCancelledOrder.id);
	expect(order.status).toBe(OrderStatus.Cancelled);
});
