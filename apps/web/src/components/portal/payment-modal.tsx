"use client";

import { env } from "@collab/env/web";
import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/utils/trpc";

// Initialize Stripe outside of component to avoid recreating it
const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({
	onSuccess,
	amount,
}: {
	onSuccess: () => void;
	amount: number;
}) {
	const stripe = useStripe();
	const elements = useElements();
	const [message, setMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!(stripe && elements)) {
			return;
		}

		setIsLoading(true);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: window.location.href, // Or a dedicated success page
			},
			redirect: "if_required",
		});

		if (error) {
			if (error.type === "card_error" || error.type === "validation_error") {
				setMessage(error.message ?? "An unexpected error occurred.");
			} else {
				setMessage("An unexpected error occurred.");
			}
			setIsLoading(false);
		} else {
			// Payment succeeded (if no redirect)
			toast.success("Payment successful!");
			onSuccess();
			setIsLoading(false);
		}
	};

	return (
		<form id="payment-form" onSubmit={handleSubmit}>
			<PaymentElement id="payment-element" />
			{message && (
				<div className="mt-2 text-red-500 text-sm" id="payment-message">
					{message}
				</div>
			)}
			<Button
				className="mt-4 w-full"
				disabled={isLoading || !stripe || !elements}
				id="submit"
			>
				{isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
			</Button>
		</form>
	);
}

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	invoiceId: string;
	amount: number;
	onSuccess: () => void;
}

export function PaymentModal({
	isOpen,
	onClose,
	invoiceId,
	amount,
	onSuccess,
}: PaymentModalProps) {
	const [clientSecret, setClientSecret] = useState<string | null>(null);

	const createPaymentIntent = useMutation(
		trpc.portal.createPaymentIntent.mutationOptions({
			onSuccess: (data) => {
				setClientSecret(data.clientSecret);
			},
			onError: (error) => {
				toast.error(error.message);
				onClose();
			},
		})
	);

	useEffect(() => {
		if (isOpen && !clientSecret) {
			createPaymentIntent.mutate({ invoiceId });
		}
	}, [isOpen, invoiceId, clientSecret, createPaymentIntent]);

	return (
		<Dialog onOpenChange={onClose} open={isOpen}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Pay Invoice</DialogTitle>
					<DialogDescription>
						Enter your payment details below to pay invoice.
					</DialogDescription>
				</DialogHeader>
				{clientSecret && (
					<Elements
						options={{ clientSecret, appearance: { theme: "stripe" } }}
						stripe={stripePromise}
					>
						<CheckoutForm amount={amount} onSuccess={onSuccess} />
					</Elements>
				)}
				{!clientSecret && (
					<div className="flex justify-center py-8">
						Loading payment options...
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
