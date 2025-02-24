import mongoose from "mongoose";
import { Order } from "./order";
import { OrderStatus } from "@tranthanhbinh2603/ticket_app_library";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttrs {
	_id: string;
	price: number;
	title: string;
	orderId?: string;
}

interface TicketDoc extends mongoose.Document {
	price: number;
	title: string;
	version: number;
	orderId: string;
	isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
	findTicketByIdAndVersion(
		id: string,
		version: number
	): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		title: {
			type: String,
			required: true,
			maxlength: 50,
		},
		orderId: {
			type: mongoose.Schema.Types.ObjectId,
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
ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket({
		_id: new mongoose.Types.ObjectId(attrs._id),
		title: attrs.title,
		price: attrs.price,
	});
};

ticketSchema.statics.findTicketByIdAndVersion = async function (
	id: string,
	version: number
): Promise<TicketDoc | null> {
	return await Ticket.findOne({
		_id: id,
		version: version - 1,
	});
};
ticketSchema.methods.isReserved = async function () {
	const existingOrder = await Order.findOne({
		ticket: this,
		status: {
			$in: [
				OrderStatus.Created,
				OrderStatus.AwaitingPayment,
				OrderStatus.Complete,
			],
		},
	});
	return !!existingOrder;
};

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket, TicketDoc };
