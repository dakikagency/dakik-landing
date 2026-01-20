const GOOGLE_FONTS_URL =
	"https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Sofia+Sans+Extra+Condensed:wght@900&family=Space+Grotesk:wght@300..700&display=swap";

export default function Head() {
	return (
		<>
			<link href="https://fonts.googleapis.com" rel="preconnect" />
			<link
				crossOrigin="anonymous"
				href="https://fonts.gstatic.com"
				rel="preconnect"
			/>
			<link href={GOOGLE_FONTS_URL} rel="stylesheet" />
		</>
	);
}
