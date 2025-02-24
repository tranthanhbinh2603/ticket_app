import cors from "cors";
import helmet from "helmet";
import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import ordersRoute from "./routes/orders";
import mongoSanitize from "express-mongo-sanitize";
import {
	errorHandler,
	NotFoundError,
} from "@tranthanhbinh2603/ticket_app_library";

const app = express();
app.set("trust proxy", true);
app.use(
	cookieSession({
		signed: false, //Luu y la chi dung cho moi truong production
		secure: process.env.NODE_ENV !== "test",
	})
);
app.use(
	cors({
		origin: "https://ticket-app.com/",
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

// =====================================

app.use("/api/orders", ordersRoute);

app.all("*", async (_req, _res) => {
	throw new NotFoundError();
});

// =====================================

app.use(errorHandler);

export { app };
