import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";
import { OrderCreatedListener } from "./events/listener/order-created-listener";
import { OrderCancelledListener } from "./events/listener/order-cancelled-listener";

const start = async () => {
	await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_URL);
	natsWrapper.client.on("close", () => {
		process.exit();
	});
	process.on("SIGINT", () => natsWrapper.client.close());
	process.on("SIGTERM", () => natsWrapper.client.close());
	new OrderCreatedListener(natsWrapper.client).listen();
	new OrderCancelledListener(natsWrapper.client).listen();

	mongoose
		.connect("mongodb://tickets-mongo:27017/ticket_app")
		.then(() => {})
		.catch((e) => {
			console.log(`Error when connect Mongo: ${e}`);
		});

	app.listen(5051, () => {
		console.log("Finish start Tickets Service at port 5051");
	});
};

start();
