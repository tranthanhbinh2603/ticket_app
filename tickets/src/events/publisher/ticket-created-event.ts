import {
	Publisher,
	Subject,
	TicketCreatedEvent,
	TicketCreatedEventData,
} from "@tranthanhbinh2603/ticket_app_library";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	subject: Subject.TicketCreated = Subject.TicketCreated;
	data: TicketCreatedEventData;
}
