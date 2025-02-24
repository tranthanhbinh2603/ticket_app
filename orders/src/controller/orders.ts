import {
	BadRequestError,
	DatabaseConnectionError,
	NotFoundError,
	OrderStatus,
	RequestValidationError,
} from "@tranthanhbinh2603/ticket_app_library";
import { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { OrderCreatedPublisher } from "../events/publisher/order-created-event";
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCancelledPublisher } from "../events/publisher/order-cancelled-event";

const getOrderOfUser = async (req: Request, res: Response): Promise<any> => {
	try {
		const orderOfUserLogged = await Order.find({
			userID: req.currentUser.id,
		}).populate("ticket");
		res.status(200).json(orderOfUserLogged);
	} catch {
		throw new DatabaseConnectionError();
	}
};

const getOrderOfUserById = async (
	req: Request,
	res: Response
): Promise<any> => {
	const orderQuery = await Order.findById(req.params.id).populate("ticket");
	if (req.currentUser.id != orderQuery.userID) {
		throw new NotFoundError();
	}
	res.status(200).json(orderQuery);
};

const createOrderByTicketId = async (
	req: Request,
	res: Response
): Promise<any> => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const { ticketID } = req.body;
	if (!mongoose.Types.ObjectId.isValid(ticketID)) {
		throw new NotFoundError();
	}
	const ticket = await Ticket.findById(ticketID);
	if (!ticket) {
		throw new NotFoundError();
	}
	const existingOrder = await ticket.isReserved();
	if (existingOrder) {
		throw new BadRequestError(false, "Ticket is already reserved");
	}
	const expiredAt = new Date().setSeconds(
		new Date().getSeconds() +
			parseInt(process.env.ORDER_EXPIRY_DURATION_SECONDS)
	);
	const { id: userID } = req.currentUser;
	const newOrderData = new Order({
		userID,
		status: OrderStatus.Created,
		expiredAt,
		ticket,
	});
	await newOrderData.save();
	const ticketData = {
		id: ticket._id.toString(),
		price: ticket.price,
		title: ticket.title,
	};
	await new OrderCreatedPublisher(natsWrapper.client).publish({
		id: newOrderData._id,
		userID,
		status: OrderStatus.Created,
		expiredAt: new Date(expiredAt),
		ticket: ticketData,
	});
	return res.status(201).json({
		msg: "Successful",
	});
};

const cancelOrder = async (req: Request, res: Response): Promise<any> => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const { orderID } = req.body;
	if (!mongoose.Types.ObjectId.isValid(orderID)) {
		throw new NotFoundError();
	}
	const order = await Order.findById(orderID);
	if (!order) {
		throw new NotFoundError();
	}
	if (order.status === OrderStatus.Cancelled) {
		throw new BadRequestError(false, "Order is already cancelled");
	}
	order.status = OrderStatus.Cancelled;
	await order.save();
	await new OrderCancelledPublisher(natsWrapper.client).publish({
		id: order._id,
	});
	return res.status(200).json({
		msg: "Successful",
	});
};

export {
	getOrderOfUser,
	getOrderOfUserById,
	createOrderByTicketId,
	cancelOrder,
};
