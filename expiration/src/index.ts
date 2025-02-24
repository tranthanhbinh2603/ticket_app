import { app } from "./app";
import { OrderCreatedListener } from "./event/listener/order-created-listener";
import { natsWrapper } from "./event/nats-wrapper";

const start = async () => {
	app.listen(5050, async () => {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_URL
		);
		natsWrapper.client.on("close", () => {
			process.exit();
		});
		process.on("SIGINT", () => natsWrapper.client.close());
		process.on("SIGTERM", () => natsWrapper.client.close());
		new OrderCreatedListener(natsWrapper.client).listen();
		console.log("Finish start server at port 5053");
		console.log("===========================");
	});
};

start();
