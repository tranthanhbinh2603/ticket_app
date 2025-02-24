import {
	ExpirationCompleteEvent,
	ExpirationCompleteEventData,
	Publisher,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subject.ExpirationComplete = Subject.ExpirationComplete;
	data: ExpirationCompleteEventData;
}
