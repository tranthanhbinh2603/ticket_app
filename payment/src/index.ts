import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./event/nats-wrapper";
import { OrderCancelledListener } from "./event/listener/order-cancelled-listener";
import { OrderCreatedListener } from "./event/listener/order-created-listener";

const start = async () => {
	app.listen(5054, async () => {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_URL
		);
		natsWrapper.client.on("close", () => {
			process.exit();
		});
		process.on("SIGINT", () => natsWrapper.client.close());
		process.on("SIGTERM", () => natsWrapper.client.close());
		new OrderCancelledListener(natsWrapper.client).listen();
		new OrderCreatedListener(natsWrapper.client).listen();
		mongoose
			.connect("mongodb://payment-mongo:27017/ticket_app")
			.then(() => {
				console.log("Connect Successful!");
				console.log("===========================");
			})
			.catch((e) => {
				console.log("Error when connect");
				console.log(`This is error: ${e}`);
				console.log("===========================");
			});
		console.log("Finish start server at port 5054");
		console.log("===========================");
	});
};

start();
