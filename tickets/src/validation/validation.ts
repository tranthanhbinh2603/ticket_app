import { body } from "express-validator";
import mongoose from "mongoose";

export const validateTicketData = [
	body("title")
		.exists({ checkFalsy: true })
		.withMessage("Title is required")
		.isLength({ max: 50 })
		.withMessage("Title must not exceed 50 characters "),
	body("price")
		.exists({ checkFalsy: true })
		.withMessage("Title is required")
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number"),
];

export const validateTicketID = [
	body("ticketID")
		.not()
		.isEmpty()
		.withMessage("ticketID is not empty")
		.custom((ticketID: string) => {
			return mongoose.Types.ObjectId.isValid(ticketID);
		})
		.withMessage("ticketID is not valid"),
];
