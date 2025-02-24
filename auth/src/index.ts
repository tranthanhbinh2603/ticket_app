import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
	if (!process.env.MONGO_URI) {
		throw new Error("Missing MONGO_URI");
	}
	mongoose
		.connect("mongodb://auth-mongo:27017/ticket_app")
		.then(async () => {})
		.catch((e) => {
			console.log(`Error when connect Mongo: ${e}`);
		});

	app.listen(5050, () => {
		console.log("Finish start Auth Service at port 5050");
	});
};

start();
