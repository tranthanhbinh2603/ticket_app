import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@tranthanhbinh2603/ticket_app_library";

interface OrderAttrs {
	_id: string;
	status: OrderStatus;
	userID: string;
	priceTicket: number;
}

interface OrderDoc extends mongoose.Document {
	_id: string;
	status: OrderStatus;
	version: number;
	userID: string;
	priceTicket: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
		},
		status: {
			type: String,
			required: true,
		},
		userID: {
			type: String,
			required: true,
		},
		priceTicket: {
			type: Number,
			required: true,
		},
	},
	{
		toJSON: {
			transform(_doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order(attrs);
};

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
