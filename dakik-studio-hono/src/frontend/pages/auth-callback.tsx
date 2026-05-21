import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
		<div className="flex min-h-screen items-center justify-center bg-white">
			<div className="flex flex-col items-center gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
				<p className="text-gray-500 text-sm">Redirecting...</p>
			</div>
		</div>
	);
}

export default AuthCallbackPage;
