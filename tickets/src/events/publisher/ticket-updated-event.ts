import {
	Publisher,
	Subject,
	TicketUpdatedEvent,
	TicketUpdatedEventData,
} from "@tranthanhbinh2603/ticket_app_library";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	subject: Subject.TicketUpdated = Subject.TicketUpdated;
	data: TicketUpdatedEventData;
}
