import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
	// apiVersion: "2020-03-02",
	apiVersion: "2025-01-27.acacia",
});
