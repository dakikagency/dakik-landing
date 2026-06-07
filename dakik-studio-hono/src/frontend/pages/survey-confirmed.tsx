import { useHead } from "@unhead/react";
import { Navigate, useLocation } from "react-router-dom";
import { type BookedMeeting, SuccessScreen } from "./survey";

/**
 * Booking-confirmation page at /survey/confirmed.
 *
 * Gated: only reachable straight after a completed booking, which arrives via
 * client navigation carrying the meeting in location.state (see
 * SurveyPage.handleMeetingBooked). A direct visit, refresh, or crawler has no
 * state and is bounced to /survey — so the page (and any conversion tag on it)
 * only ever renders for a real booking, never a direct hit.
 */
export function SurveyConfirmedPage() {
	useHead({
		title: "Booked · Dakik Studio",
		meta: [{ name: "robots", content: "noindex" }],
	});

	const location = useLocation();
	const meeting = (location.state as { meeting?: BookedMeeting } | null)
		?.meeting;

	if (!meeting) {
		return <Navigate replace to="/survey" />;
	}

	return <SuccessScreen meeting={meeting} />;
}

export default SurveyConfirmedPage;
