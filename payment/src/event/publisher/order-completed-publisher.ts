import {
	OrderCompletedEvent,
	OrderCompletedEventData,
	Publisher,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
	subject: Subject.OrderCompleted = Subject.OrderCompleted;
	data: OrderCompletedEventData;
}
