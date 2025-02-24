import { body } from "express-validator";
import mongoose from "mongoose";

export const validateTicketID = [
	body("ticketID").not().isEmpty().withMessage("ticketID is not empty"),
	body("ticketID")
		.custom((ticketID: string) => {
			return mongoose.Types.ObjectId.isValid(ticketID);
		})
		.withMessage("ticketID is not valid"),
];

export const validateOrderID = [
	body("orderID")
		.not()
		.isEmpty()
		.withMessage("orderID is not empty")
		.custom((orderID: string) => {
			return mongoose.Types.ObjectId.isValid(orderID);
		})
		.withMessage("orderID is not valid"),
];
