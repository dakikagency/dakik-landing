import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Dakik Studio - Boutique Digital Agency";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#000000",
				backgroundImage:
					"radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)",
				backgroundSize: "100px 100px",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
				}}
			>
				{/* Logo/Brand Mark */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: 40,
					}}
				>
					<div
						style={{
							width: 80,
							height: 80,
							borderRadius: 16,
							backgroundColor: "#ffffff",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 48,
							fontWeight: 700,
							color: "#000000",
						}}
					>
						D
					</div>
				</div>

				{/* Main Title */}
				<div
					style={{
						display: "flex",
						fontSize: 72,
						fontWeight: 700,
						color: "#ffffff",
						letterSpacing: "-0.02em",
						marginBottom: 20,
					}}
				>
					Dakik Studio
				</div>

				{/* Subtitle */}
				<div
					style={{
						display: "flex",
						fontSize: 28,
						color: "#a3a3a3",
						letterSpacing: "0.1em",
						textTransform: "uppercase",
					}}
				>
					Boutique Digital Agency
				</div>

				{/* Tagline */}
				<div
					style={{
						display: "flex",
						fontSize: 24,
						color: "#737373",
						marginTop: 40,
						maxWidth: 800,
						textAlign: "center",
						lineHeight: 1.5,
					}}
				>
					AI Automation - Brand Identity - Web & Mobile Development
				</div>
			</div>
		</div>,
		{
			...size,
		}
	);
}
