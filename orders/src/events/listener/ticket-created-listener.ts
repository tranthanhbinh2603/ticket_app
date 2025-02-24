import {
	TargetServiceName,
	Listener,
	Subject,
	TicketCreatedEvent,
	TicketCreatedEventData,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	subject: Subject.TicketCreated = Subject.TicketCreated;
	targetService: TargetServiceName.OrderService =
		TargetServiceName.OrderService;
	data: TicketCreatedEventData;

	async onMessage(data: TicketCreatedEvent["data"], _msg: Message) {
		const newTicket = new Ticket({
			_id: data.id,
			title: data.title,
			price: data.price,
		});
		await newTicket.save();
		_msg.ack();
	}
}
