import type { Route } from "next";
import { redirect } from "next/navigation";

export default function LegacyTermsPage() {
	redirect("/terms-of-service" as Route);
}
