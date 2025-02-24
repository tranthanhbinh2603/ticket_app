import mongoose from "mongoose";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { natsWrapper } from "../events/nats-wrapper";
import {
	BadRequestError,
	DatabaseConnectionError,
	NotAuthorizedError,
	NotFoundError,
	RequestValidationError,
} from "@tranthanhbinh2603/ticket_app_library";
import { Ticket } from "../model/ticket";
import { TicketCreatedPublisher } from "../events/publisher/ticket-created-event";
import { TicketDeletedPublisher } from "../events/publisher/ticket-deleted-event";
import { TicketUpdatedPublisher } from "../events/publisher/ticket-updated-event";

const getAllTickets = async (_req: Request, res: Response): Promise<any> => {
	try {
		const allTickets = await Ticket.find({});
		return res.status(200).json({
			count_ticket: allTickets.length,
			ticket_data: allTickets,
		});
	} catch (error) {
		throw new DatabaseConnectionError();
	}
};

const getTicketById = async (req: Request, res: Response): Promise<any> => {
	const { id: _id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(_id)) {
		throw new NotFoundError();
	}
	const ticket = await Ticket.findById(_id);
	if (!ticket) {
		throw new NotFoundError();
	}
	return res.status(200).json({
		ticket_data: ticket,
	});
};

const createTicket = async (req: Request, res: Response): Promise<any> => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const { title, price } = req.body;
	const { id: userId } = req.currentUser;
	const newTicket = new Ticket({ title, price, userId });
	await newTicket.save();
	await new TicketCreatedPublisher(natsWrapper.client).publish({
		id: newTicket._id.toString(),
		version: newTicket.version,
		title,
		price,
	});
	res.status(201).json({
		msg: "successful",
		ticket_data: newTicket,
	});
};

const editTicket = async (req: Request, res: Response): Promise<any> => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const { id } = req.params;
	const { title, price } = req.body;
	const { id: userId } = req.currentUser;
	const ticket = await Ticket.findById(id);
	if (ticket.userId != userId) {
		throw new NotAuthorizedError();
	}
	ticket.set({ title, price });
	await ticket.save();
	await new TicketUpdatedPublisher(natsWrapper.client).publish({
		id: ticket._id.toString(),
		version: ticket.version,
		title,
		price,
	});
	res.status(200).json({
		msg: "successful",
		ticket_data: ticket,
	});
};

const deleteTicket = async (req: Request, res: Response): Promise<any> => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		throw new RequestValidationError(result.array());
	}
	const { ticketID } = req.body;
	const { id: userId } = req.currentUser;
	const ticket = await Ticket.findById(ticketID);
	if (ticket.userId != userId) {
		throw new NotAuthorizedError();
	}
	if (ticket.orderId) {
		throw new BadRequestError();
	}
	await Ticket.findByIdAndDelete(ticketID);
	await new TicketDeletedPublisher(natsWrapper.client).publish({
		id: ticket._id.toString(),
	});
	res.status(200).json({
		msg: "successful",
	});
};

export { getAllTickets, getTicketById, createTicket, editTicket, deleteTicket };
