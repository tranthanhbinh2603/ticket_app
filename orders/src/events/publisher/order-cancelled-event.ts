import {
	Publisher,
	Subject,
	OrderCancelledEvent,
	OrderCancelledEventData,
} from "@tranthanhbinh2603/ticket_app_library";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subject.OrderCancelled = Subject.OrderCancelled;
	data: OrderCancelledEventData;
}
