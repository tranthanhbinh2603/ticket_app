import { body } from "express-validator";

export const validateOrderPayment = [
	body("orderID").exists().withMessage("Must have orderID"),
	body("token").exists().withMessage("Must have token"),
];
