import {
	TargetServiceName,
	Listener,
	OrderCancelledEvent,
	OrderCancelledEventData,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../model/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-event";
import { natsWrapper } from "../nats-wrapper";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subject.OrderCancelled = Subject.OrderCancelled;
	targetService: TargetServiceName.TicketService =
		TargetServiceName.TicketService;
	data: OrderCancelledEventData;

	async onMessage(
		data: OrderCancelledEvent["data"],
		_msg: Message
	): Promise<void> {
		const ticket = await Ticket.findOne({ orderId: data.id });
		if (!ticket) {
			return;
		}
		ticket.set({ orderId: null });
		await ticket.save();
		new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			version: ticket.version,
			title: ticket.title,
			price: ticket.price,
			orderId: ticket.orderId,
		});
		_msg.ack();
	}
}
