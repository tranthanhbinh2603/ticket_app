import {
	errorHandler,
	NotFoundError,
} from "@tranthanhbinh2603/ticket_app_library";
import express from "express";
import helmet from "helmet";
import "express-async-errors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false }));

app.all("*", async (_req, _res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
