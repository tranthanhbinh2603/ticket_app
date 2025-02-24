import {
	OrderCreatedEvent,
	OrderCreatedEventData,
	Publisher,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subject.OrderCreated = Subject.OrderCreated;
	data: OrderCreatedEventData;
}
