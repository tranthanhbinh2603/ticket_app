import express from "express";
import {
	createTicket,
	deleteTicket,
	editTicket,
	getAllTickets,
	getTicketById,
} from "../controllers/ticket";
import {
	checkAuth,
	getCurrentUser,
} from "@tranthanhbinh2603/ticket_app_library";
import { validateTicketData, validateTicketID } from "../validation/validation";

const app = express.Router();

app.get("/", getAllTickets);
app.get("/:id", getTicketById);
app.post("/", getCurrentUser, checkAuth, validateTicketData, createTicket);
app.put("/:id", getCurrentUser, checkAuth, validateTicketData, editTicket);
app.delete("/", getCurrentUser, checkAuth, validateTicketID, deleteTicket);

export default app;
