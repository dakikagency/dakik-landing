import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useSession } from "../hooks/useSession";

export function PortalAccessDeniedPage() {
	const { user, signOut } = useSession();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
			<div className="w-full max-w-md text-center">
				<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
					<Shield className="h-8 w-8 text-gray-500" />
				</div>
				<h1 className="mb-2 font-bold text-2xl tracking-tight">Access Restricted</h1>
				<p className="mb-6 text-gray-500">
					The customer portal is only available to users who have submitted a project inquiry
					through our survey form.
				</p>

				{user && (
					<p className="mb-6 text-gray-500 text-sm">
						Signed in as <span className="font-medium text-black">{user.email}</span>
					</p>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 font-medium text-sm text-white transition hover:bg-gray-800"
						to="/survey"
					>
						Submit a project inquiry
					</Link>
					<Link
						className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-5 font-medium text-sm text-gray-700 transition hover:bg-gray-50"
						to="/"
					>
						Back to home
					</Link>
					{user && (
						<button
							className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-5 font-medium text-gray-500 text-sm transition hover:bg-gray-50"
							onClick={() => {
								signOut().then(() => {
									window.location.href = "/";
								});
							}}
							type="button"
						>
							Sign out
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export default PortalAccessDeniedPage;
