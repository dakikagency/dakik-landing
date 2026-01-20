import { env } from "@collab/env/server";
import Stripe from "stripe";

export const stripe = new Stripe(
	env.STRIPE_SECRET_KEY || "sk_test_placeholder",
	{
		apiVersion: "2025-12-15.clover",
		typescript: true,
	}
);
