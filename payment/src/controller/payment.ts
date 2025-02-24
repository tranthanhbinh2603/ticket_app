import {
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	RequestValidationError,
} from "@tranthanhbinh2603/ticket_app_library";
import { validationResult } from "express-validator";
import { Response, Request } from "express";
import { Order } from "../model/order";
import { stripe } from "../library/stripe";
import mongoose from "mongoose";
import { OrderCompletedPublisher } from "../event/publisher/order-completed-publisher";
import { natsWrapper } from "../event/nats-wrapper";

const paymentProcess = async (req: Request, res: Response): Promise<any> => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const { orderID, token: tokenPayment } = req.body;
	if (!mongoose.isObjectIdOrHexString(orderID)) {
		throw new NotFoundError();
	}
	try {
		await stripe.tokens.retrieve(tokenPayment);
	} catch {
		throw new BadRequestError(false, "Stripe token payment not valid");
	}
	const orderToPayment = await Order.findById(orderID);
	if (!orderToPayment) {
		throw new NotFoundError();
	}
	if (orderToPayment.userID != req.currentUser.id) {
		throw new NotAuthorizedError();
	}
	if (orderToPayment.status == OrderStatus.Complete) {
		throw new BadRequestError(false, "Order was completed");
	}
	if (orderToPayment.status == OrderStatus.Cancelled) {
		throw new BadRequestError(false, "Order was cancelled");
	}
	await stripe.charges.create({
		amount: orderToPayment.priceTicket,
		currency: "usd",
		source: tokenPayment,
		metadata: {
			orderID: orderToPayment.id,
		},
	});
	await new OrderCompletedPublisher(natsWrapper.client).publish({
		id: orderToPayment.id,
	});
	return res.status(201).json({
		msg: "successful",
	});
};

export { paymentProcess };
