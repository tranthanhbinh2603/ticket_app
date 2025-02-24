import { TicketCreatedEvent } from "@tranthanhbinh2603/ticket_app_library";
import { TicketCreatedListener } from "../events/listener/ticket-created-listener";
import { natsWrapper } from "../events/nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";

const setup = async () => {
	// create an instance of the listener
	const listener = new TicketCreatedListener(natsWrapper.client);

	// create a fake data event
	const dataFirstTicket: TicketCreatedEvent["data"] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		title: "First ticket",
		price: 50,
	};
	// create a fake message object
	const msg = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, dataFirstTicket, msg };
};

it("TICKET CREATED LISTENER: Creates and saves a ticket", async () => {
	const { listener, dataFirstTicket, msg } = await setup();
	// call the onMessage function with the data object + message object
	await listener.onMessage(dataFirstTicket, msg);
	// write assertions to make sure a ticket was created!
	const ticket = await Ticket.findById(dataFirstTicket.id);

	expect(ticket).toBeDefined();
	expect(ticket.version).toBe(dataFirstTicket.version);
	expect(ticket.title).toBe(dataFirstTicket.title);
	expect(ticket.price).toBe(dataFirstTicket.price);
});

it("TICKET CREATED LISTENER: Acks the message", async () => {
	const { listener, dataFirstTicket, msg } = await setup();
	// call the onMessage function with the data object + message object
	await listener.onMessage(dataFirstTicket, msg);
	// write assertions to make sure ack function is called
	expect(msg.ack).toHaveBeenCalledTimes(1);
});
