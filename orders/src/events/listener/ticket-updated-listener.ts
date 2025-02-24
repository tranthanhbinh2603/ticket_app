import {
	TargetServiceName,
	Listener,
	Subject,
	TicketUpdatedEvent,
	TicketUpdatedEventData,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	subject: Subject.TicketUpdated = Subject.TicketUpdated;
	targetService: TargetServiceName.OrderService =
		TargetServiceName.OrderService;
	data: TicketUpdatedEventData;

	async onMessage(data: TicketUpdatedEvent["data"], _msg: Message) {
		const ticket = await Ticket.findTicketByIdAndVersion(data.id, data.version);
		if (!ticket) {
			return;
		}
		ticket.set({ title: data.title, price: data.price, orderId: data.orderId });
		await ticket.save();
		_msg.ack();
	}
}
