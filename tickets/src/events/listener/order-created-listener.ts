import {
	TargetServiceName,
	Listener,
	OrderCreatedEvent,
	OrderCreatedEventData,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../model/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-event";
import { natsWrapper } from "../nats-wrapper";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subject.OrderCreated = Subject.OrderCreated;
	targetService: TargetServiceName.TicketService =
		TargetServiceName.TicketService;
	data: OrderCreatedEventData;

	async onMessage(data: OrderCreatedEvent["data"], _msg: Message) {
		const ticketOrdered = await Ticket.findById(data.ticket.id);
		if (!ticketOrdered) {
			return;
		}
		ticketOrdered.set({ orderId: data.id });
		await ticketOrdered.save();
		await new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticketOrdered.id,
			version: ticketOrdered.version,
			title: ticketOrdered.title,
			price: ticketOrdered.price,
			orderId: ticketOrdered.orderId,
		});
		_msg.ack();
	}
}
