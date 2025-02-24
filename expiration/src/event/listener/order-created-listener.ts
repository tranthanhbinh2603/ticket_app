import {
	TargetServiceName,
	Listener,
	OrderCreatedEvent,
	OrderCreatedEventData,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queue/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subject.OrderCreated = Subject.OrderCreated;
	targetService: TargetServiceName.ExpirationService =
		TargetServiceName.ExpirationService;
	data: OrderCreatedEventData;

	async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
		await expirationQueue.add(
			{
				orderID: data.id,
			},
			{
				delay: 900000,
			}
		);
		msg.ack();
	}
}
