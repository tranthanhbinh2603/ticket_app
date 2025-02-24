import {
	Listener,
	OrderCompletedEvent,
	OrderCompletedEventData,
	OrderStatus,
	Subject,
	TargetServiceName,
} from "@tranthanhbinh2603/ticket_app_library";
import { Order } from "../../models/order";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
	subject: Subject.OrderCompleted = Subject.OrderCompleted;
	targetService: TargetServiceName.OrderService =
		TargetServiceName.OrderService;
	data: OrderCompletedEventData;

	async onMessage(data: OrderCompletedEvent["data"], _msg: Message) {
		if (!mongoose.isValidObjectId(data.id)) {
			return;
		}
		const order = await Order.findById(data.id);
		if (!order) {
			return;
		}
		if (
			order.status != OrderStatus.Complete &&
			order.status != OrderStatus.Cancelled
		) {
			order.set({ status: OrderStatus.Complete });
			await order.save();
		}

		_msg.ack();
	}
}
