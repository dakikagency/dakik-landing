import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Noise from "../components/noise";
import { useSession } from "../hooks/useSession";

export function AuthCallbackPage() {
	const { user, isLoading } = useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (isLoading) return;
		const role = user?.role;
		if (role === "ADMIN") {
			navigate("/admin", { replace: true });
		} else if (role === "CUSTOMER") {
			navigate("/portal", { replace: true });
		} else {
			navigate("/portal-access-denied", { replace: true });
		}
	}, [user, isLoading, navigate]);

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
			<div className="flex flex-col items-center gap-6">
				<div className="h-6 w-6 animate-spin border-2 border-white/20 border-t-white" />
				<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
					// Redirecting
				</span>
			</div>
			<Noise patternAlpha={20} patternRefreshInterval={3} />
		</div>
	);
}

export default AuthCallbackPage;
