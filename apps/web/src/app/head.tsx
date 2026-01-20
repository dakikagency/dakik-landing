const GOOGLE_FONTS_URL =
	"https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Sofia+Sans+Extra+Condensed:wght@900&family=Space+Grotesk:wght@300..700&display=swap";

export default function Head() {
	return (
		<>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link
				rel="preconnect"
				href="https://fonts.gstatic.com"
				crossOrigin="anonymous"
			/>
			<link rel="stylesheet" href={GOOGLE_FONTS_URL} />
		</>
	);
}
