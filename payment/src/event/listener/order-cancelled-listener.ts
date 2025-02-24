import {
	TargetServiceName,
	Listener,
	OrderCancelledEvent,
	OrderCancelledEventData,
	OrderStatus,
	Subject,
} from "@tranthanhbinh2603/ticket_app_library";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subject.OrderCancelled = Subject.OrderCancelled;
	targetService: TargetServiceName.PaymentService =
		TargetServiceName.PaymentService;
	data: OrderCancelledEventData;

	async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
		const orderToCancelled = await Order.findById(data.id);
		if (!orderToCancelled) {
			return;
		}
		if (orderToCancelled.status == OrderStatus.Complete) {
			return;
		}
		orderToCancelled.set({ status: OrderStatus.Cancelled });
		await orderToCancelled.save();
		msg.ack();
	}
}
