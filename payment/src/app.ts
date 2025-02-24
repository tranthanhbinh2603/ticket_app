import "express-async-errors";
import express from "express";
import path from "path";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import {
	errorHandler,
	NotFoundError,
} from "@tranthanhbinh2603/ticket_app_library";
import cookieSession from "cookie-session";
import paymentRoute from "../src/route/payment";

const app = express();
app.use(
	cookieSession({
		signed: false, //Luu y la chi dung cho moi truong production
		secure: process.env.NODE_ENV !== "test",
	})
);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname) + "/views");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

app.use("/api/payment", paymentRoute);

app.all("*", async (_req, _res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
