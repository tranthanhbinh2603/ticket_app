import express from "express";
import {
	cancelOrder,
	createOrderByTicketId,
	getOrderOfUser,
	getOrderOfUserById,
} from "../controller/orders";
import {
	checkAuth,
	getCurrentUser,
} from "@tranthanhbinh2603/ticket_app_library";
import { validateOrderID, validateTicketID } from "../validation/validation";

const router = express.Router();

router.get("/", getCurrentUser, checkAuth, getOrderOfUser);
router.get("/:id", getCurrentUser, checkAuth, getOrderOfUserById);
router.post(
	"/",
	getCurrentUser,
	checkAuth,
	validateTicketID,
	createOrderByTicketId
);
router.delete("/", getCurrentUser, checkAuth, validateOrderID, cancelOrder);

export default router;
