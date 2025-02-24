import {
	TargetServiceName,
	Listener,
	Subject,
	TicketDeletedEvent,
	TicketDeletedEventData,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

export class TicketDeletedListener extends Listener<TicketDeletedEvent> {
	subject: Subject.TicketDeleted = Subject.TicketDeleted;
	targetService: TargetServiceName.OrderService =
		TargetServiceName.OrderService;
	data: TicketDeletedEventData;

	async onMessage(data: TicketDeletedEvent["data"], _msg: Message) {
		const ticket = await Ticket.findById(data.id);
		if (!ticket || ticket.orderId) {
			return;
		}
		await ticket.deleteOne();
		_msg.ack();
	}
}
