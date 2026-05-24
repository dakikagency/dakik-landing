import { Link } from "react-router-dom";
import Noise from "../components/noise";
import { useSession } from "../hooks/useSession";

export function PortalAccessDeniedPage() {
	const { user, signOut } = useSession();

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-[clamp(1.5rem,5vw,4rem)] py-12 text-white">
			<div className="relative z-10 w-full max-w-xl text-center">
				<div className="mb-6 flex items-center justify-center gap-3">
					<span className="h-px w-12 bg-white/20" />
					<span className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
						// Access restricted
					</span>
					<span className="h-px w-12 bg-white/20" />
				</div>

				<h1 className="font-black text-[clamp(2.5rem,8vw,5rem)] uppercase leading-[0.85] tracking-[-0.04em]">
					<span className="block">No</span>
					<span className="block">Portal.</span>
				</h1>

				<p className="mx-auto mt-8 max-w-[40ch] text-base text-white/70 leading-snug sm:text-lg">
					The customer portal is only available to users who&apos;ve submitted a
					project inquiry through our survey.
				</p>

				{user && (
					<p className="mt-6 font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
						// Signed in as{" "}
						<span className="text-white/80">{user.email}</span>
					</p>
				)}

				<div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
					<Link
						className="inline-flex items-center justify-center border-4 border-white bg-white px-6 py-3 font-medium text-black uppercase tracking-wider transition-colors duration-300 hover:bg-black hover:text-white"
						to="/survey"
					>
						<span className="text-sm">Start a project</span>
					</Link>
					<Link
						className="inline-flex items-center justify-center border-2 border-white/20 bg-transparent px-6 py-3 font-medium text-white uppercase tracking-wider transition-colors duration-300 hover:border-white hover:bg-white/5"
						to="/"
					>
						<span className="text-sm">Back to site</span>
					</Link>
					{user && (
						<button
							className="inline-flex items-center justify-center border-2 border-white/10 bg-transparent px-6 py-3 font-medium text-white/60 uppercase tracking-wider transition-colors duration-300 hover:border-white/30 hover:text-white"
							onClick={() => {
								signOut().then(() => {
									window.location.href = "/";
								});
							}}
							type="button"
						>
							<span className="text-sm">Sign out</span>
						</button>
					)}
				</div>
			</div>

			<Noise patternAlpha={18} patternRefreshInterval={3} />
		</div>
	);
}

export default PortalAccessDeniedPage;
