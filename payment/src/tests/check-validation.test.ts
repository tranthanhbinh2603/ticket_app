import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";

it("CHECK VALIDATION: Check if not login", async () => {
	const request_data = await request(app).post("/api/payment/").send({
		orderID: new mongoose.Types.ObjectId().toHexString(),
		token: "jcjcjcjdjdj",
	});
	expect(request_data.body.errors).toBeDefined();
	expect(request_data.body.errors.length).toBe(1);
	expect(request_data.body.errors[0].msg).toBeDefined();
	expect(request_data.body.errors[0].msg).toBe("You are not logged in.");
});

it("CHECK VALIDATION: Miss OrderID", async () => {
	const request_data = await request(app)
		.post("/api/payment/")
		.send({
			token: "jcjcjcjdjdj",
		})
		.set("Cookie", global.signInUserOne());
	expect(request_data.body.errors).toBeDefined();
	expect(request_data.body.errors.length).toBe(1);
	expect(request_data.body.errors[0].msg).toBeDefined();
	expect(request_data.body.errors[0].msg).toBe("Must have orderID");
});

it("CHECK VALIDATION: Miss token", async () => {
	const request_data = await request(app)
		.post("/api/payment/")
		.send({
			orderID: new mongoose.Types.ObjectId().toHexString(),
		})
		.set("Cookie", global.signInUserOne());
	expect(request_data.body.errors).toBeDefined();
	expect(request_data.body.errors.length).toBe(1);
	expect(request_data.body.errors[0].msg).toBeDefined();
	expect(request_data.body.errors[0].msg).toBe("Must have token");
});
