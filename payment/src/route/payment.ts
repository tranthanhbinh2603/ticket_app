import express from "express";
import { checkAuth } from "@tranthanhbinh2603/ticket_app_library";
import { getCurrentUser } from "@tranthanhbinh2603/ticket_app_library";
import { validateOrderPayment } from "../validation/payment";
import { paymentProcess } from "../controller/payment";

const app = express.Router();

app.post("/", getCurrentUser, checkAuth, validateOrderPayment, paymentProcess);

export default app;
