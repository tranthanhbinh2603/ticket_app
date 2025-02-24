import {
	TargetServiceName,
	Listener,
	OrderCreatedEvent,
	OrderCreatedEventData,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subject.OrderCreated = Subject.OrderCreated;
	targetService: TargetServiceName.PaymentService =
		TargetServiceName.PaymentService;
	data: OrderCreatedEventData;

	async onMessage(data: OrderCreatedEvent["data"], _msg: Message) {
		const newOrder = Order.build({
			_id: data.id,
			status: data.status,
			userID: data.userID,
			priceTicket: data.ticket.price,
		});
		await newOrder.save();
		_msg.ack();
	}
}
