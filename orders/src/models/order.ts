import mongoose from "mongoose";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@tranthanhbinh2603/ticket_app_library";

interface OrderAttrs {
	userID: string;
	status: OrderStatus;
	expiredAt: Date;
	ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<any> {
	build(attrs: OrderAttrs): any;
}

const orderSchema = new mongoose.Schema(
	{
		userID: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		expiredAt: {
			type: mongoose.Schema.Types.Date,
		},
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Ticket",
		},
	},
	{
		toJSON: {
			transform(_doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
				delete ret.password;
			},
		},
	}
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order(attrs);
};

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

const Order = mongoose.model<any, OrderModel>("Order", orderSchema);

export { Order };
