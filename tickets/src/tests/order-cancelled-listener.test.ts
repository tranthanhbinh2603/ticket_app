import { natsWrapper } from "../events/nats-wrapper";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { TicketDeletedEvent } from "@tranthanhbinh2603/ticket_app_library";
import { OrderCancelledListener } from "../events/listener/order-cancelled-listener";
import { Ticket } from "../model/ticket";

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	const orderId = new mongoose.Types.ObjectId().toHexString();

	const ticketHaveOrder = Ticket.build({
		title: "This is ticket have ordered",
		price: 5000,
		userId: new mongoose.Types.ObjectId().toHexString(),
	});
	ticketHaveOrder.set({ orderId });

	const ticketDoNotHaveOrder = Ticket.build({
		title: "This is ticket don't have ordered",
		price: 5000,
		userId: new mongoose.Types.ObjectId().toHexString(),
	});

	await ticketDoNotHaveOrder.save();
	await ticketHaveOrder.save();

	const dataEvent: TicketDeletedEvent["data"] = {
		id: orderId,
	};

	return {
		listener,
		msg,
		ticketHaveOrder,
		ticketDoNotHaveOrder,
		dataEvent,
	};
};

it("ORDER CANCELLED LISTENER: If order cancelled have id valid", async () => {
	const { listener, msg, dataEvent, ticketHaveOrder, ticketDoNotHaveOrder } =
		await setup();
	await listener.onMessage(dataEvent, msg);
	const ticketHaveOrderFinal = await Ticket.findById(ticketHaveOrder.id);
	const ticketDoNotHaveOrderFinal = await Ticket.findById(
		ticketDoNotHaveOrder.id
	);
	expect(ticketHaveOrderFinal.orderId).toBe(null);
	expect(ticketDoNotHaveOrderFinal.orderId).not.toBeDefined();
});
it("ORDER CANCELLED LISTENER: If order cancelled have id not valid", async () => {
	const { listener, msg, dataEvent, ticketHaveOrder, ticketDoNotHaveOrder } =
		await setup();
	dataEvent.id += "ThisIsRandomString";
	await listener.onMessage(dataEvent, msg);
	const ticketHaveOrderFinal = await Ticket.findById(ticketHaveOrder.id);
	const ticketDoNotHaveOrderFinal = await Ticket.findById(
		ticketDoNotHaveOrder.id
	);
	expect(ticketHaveOrderFinal.orderId).toBe(ticketHaveOrder.orderId);
	expect(ticketDoNotHaveOrderFinal.orderId).not.toBeDefined();
});

// it("Order DELETE LISTENER: If Order valid", async () => {
// 	const { listener, msg, dataEventValidDeleted } = await setup();
// 	await listener.onMessage(dataEventValidDeleted, msg);
// 	const countOrder = await Order.countDocuments();
// 	expect(countOrder).toBe(1);
// 	expect(msg.ack).toHaveBeenCalledTimes(1);
// });

// it("Order DELETE LISTENER: If Order not valid", async () => {
// 	const { listener, msg, dataEventNotValidDeleted } = await setup();
// 	await listener.onMessage(dataEventNotValidDeleted, msg);
// 	const countTicket = await Ticket.countDocuments();
// 	expect(msg.ack).toHaveBeenCalledTimes(0);
// 	expect(countTicket).toBe(2);
// });
