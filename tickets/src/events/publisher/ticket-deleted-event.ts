import {
	Publisher,
	Subject,
	TicketDeletedEvent,
	TicketDeletedEventData,
} from "@tranthanhbinh2603/ticket_app_library";

export class TicketDeletedPublisher extends Publisher<TicketDeletedEvent> {
	subject: Subject.TicketDeleted = Subject.TicketDeleted;
	data: TicketDeletedEventData;
}
