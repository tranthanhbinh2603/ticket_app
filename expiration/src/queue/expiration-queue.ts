import Queue from "bull";
import { ExpirationCompleteEventData } from "@tranthanhbinh2603/ticket_app_library";
import { ExpirationCompletePublisher } from "../event/publisher/expiration-complete-publisher";
import { natsWrapper } from "../event/nats-wrapper";

const expirationQueue = new Queue<ExpirationCompleteEventData>(
	"order:expiration",
	{
		redis: {
			host: process.env.REDIS_HOST, //expiration-redis-srv.default.svc.cluster.local
		},
	}
);

expirationQueue.process(async (job, done) => {
	try {
		await new ExpirationCompletePublisher(natsWrapper.client).publish({
			orderID: job.data.orderID,
		});
		await done();
	} catch (err) {
		console.error("Error in processing job:", err);
	}
});

export { expirationQueue };
