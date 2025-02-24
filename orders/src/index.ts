import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";
import { TicketCreatedListener } from "./events/listener/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listener/ticket-updated-listener";
import { TicketDeletedListener } from "./events/listener/ticket-deleted-listener";
import { ExpirationCompleteListener } from "./events/listener/expiration-complete-listener";
import { OrderCompletedListener } from "./events/listener/order-completed-listener";

app.listen(5052, async () => {
	await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_URL);
	natsWrapper.client.on("close", () => {
		process.exit();
	});
	process.on("SIGINT", () => natsWrapper.client.close());
	process.on("SIGTERM", () => natsWrapper.client.close());
	new TicketCreatedListener(natsWrapper.client).listen();
	new TicketUpdatedListener(natsWrapper.client).listen();
	new TicketDeletedListener(natsWrapper.client).listen();
	new ExpirationCompleteListener(natsWrapper.client).listen();
	new OrderCompletedListener(natsWrapper.client).listen();

	mongoose
		.connect(process.env.MONGO_URI)
		.then(() => {
			console.log("Connect Successful!");
			console.log("===========================");
		})
		.catch((e) => {
			console.log("Error when connect");
			console.log(`This is error: ${e}`);
			console.log("===========================");
		});

	console.log("Finish start Orders server at port 5052");
	console.log("===========================");
});
