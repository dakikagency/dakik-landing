import type { Route } from "next";
import { redirect } from "next/navigation";

export default function LegacyPrivacyPage() {
	redirect("/privacy-policy" as Route);
}
