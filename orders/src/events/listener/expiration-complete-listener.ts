import {
	TargetServiceName,
	Listener,
	Subject,
	ExpirationCompleteEvent,
	ExpirationCompleteEventData,
	OrderStatus,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publisher/order-cancelled-event";
import { natsWrapper } from "../nats-wrapper";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
	subject: Subject.ExpirationComplete = Subject.ExpirationComplete;
	targetService: TargetServiceName.OrderService =
		TargetServiceName.OrderService;
	data: ExpirationCompleteEventData;

	async onMessage(data: ExpirationCompleteEvent["data"], _msg: Message) {
		const orderToSet = await Order.findById(data.orderID);
		if (!orderToSet) {
			return;
		}
		if (orderToSet.status != OrderStatus.Complete) {
			orderToSet.set({ status: OrderStatus.Cancelled });
			await orderToSet.save();
			await new OrderCancelledPublisher(natsWrapper.client).publish({
				id: data.orderID,
			});
		}

		_msg.ack();
	}
}
