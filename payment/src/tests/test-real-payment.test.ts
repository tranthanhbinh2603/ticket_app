import request from "supertest";
import { app } from "../app";
import { OrderStatus } from "@tranthanhbinh2603/ticket_app_library";
import { Order } from "../model/order";
import { stripe } from "../library/stripe";

it("TEST PAYMENT: It sign in wrong user", async () => {
	await global.setup();
	const orderToPayment = await Order.findOne({
		status: OrderStatus.Created,
	});
	const response = await request(app)
		.post("/api/payment/")
		.send({
			orderID: orderToPayment.id,
			token: "tok_visa",
		})
		.set("Cookie", global.signInUserTwo());
	expect(response.statusCode).toBe(401);
});

it("TEST PAYMENT: Not found ticket", async () => {
	await global.setup();
	const response = await request(app)
		.post("/api/payment/")
		.send({
			orderID: "67b9ee0a5cb87e7e45d2c79d",
			token: "tok_visa",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.statusCode).toBe(404);
});

it("TEST PAYMENT: Ticket id is not mongoose objectID", async () => {
	await global.setup();
	const response = await request(app)
		.post("/api/payment/")
		.send({
			orderID: "hahaahaisrandome",
			token: "tok_visa",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.statusCode).toBe(404);
});
it("TEST PAYMENT: If ticket is completed", async () => {
	await global.setup();
	const orderCompleted = await Order.findOne({
		status: OrderStatus.Complete,
	});
	const response = await request(app)
		.post("/api/payment/")
		.send({
			orderID: orderCompleted.id,
			token: "tok_visa",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.statusCode).toBe(500);
	expect(response.body.errors).toBeDefined();
	expect(response.body.errors.length).toBe(1);
	expect(response.body.errors[0].msg).toBe("Order was completed");
});

it("TEST PAYMENT: If ticket is cancelled", async () => {
	await global.setup();
	const orderCancelled = await Order.findOne({
		status: OrderStatus.Cancelled,
	});
	const response = await request(app)
		.post("/api/payment/")
		.send({
			orderID: orderCancelled.id,
			token: "tok_visa",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.statusCode).toBe(500);
	expect(response.body.errors).toBeDefined();
	expect(response.body.errors.length).toBe(1);
	expect(response.body.errors[0].msg).toBe("Order was cancelled");
});

it("TEST PAYMENT: If token is not valid", async () => {
	await global.setup();
	const orderHavePayment = await Order.findOne({
		status: OrderStatus.Created,
	});
	const response = await request(app)
		.post("/api/payment/")
		.send({
			orderID: orderHavePayment.id,
			token: "tok_visa_but_i_do_not_want_it",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.statusCode).toBe(500);
	expect(response.body.errors).toBeDefined();
	expect(response.body.errors.length).toBe(1);
	expect(response.body.errors[0].msg).toBe("Stripe token payment not valid");
});

it("TEST PAYMENT: Successful", async () => {
	await global.setup();
	const orderHavePayment = await Order.findOne({
		status: OrderStatus.Created,
	});
	const response = await request(app)
		.post("/api/payment/")
		.send({
			orderID: orderHavePayment.id,
			token: "tok_visa",
		})
		.set("Cookie", global.signInUserOne());
	expect(response.statusCode).toBe(201);
	expect(response.body.msg).toBeDefined();
	expect(response.body.msg).toBe("successful");
	const charges = await stripe.charges.list({ limit: 10 });
	let isOrderLooking = false;
	charges.data.forEach((charge) => {
		if (charge.metadata.orderID === orderHavePayment.id) {
			isOrderLooking = true;
		}
	});
	expect(isOrderLooking).toBe(true);
});
