import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Our Work | Dakik Studio";
export const size = { width: 1200, height: 630 };
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
					Our Work
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 28,
						color: "#a3a3a3",
						letterSpacing: "0.1em",
						textTransform: "uppercase",
					}}
				>
					Results, Not Just Repos
				</div>
			</div>
		</div>,
		{ ...size }
	);
}
