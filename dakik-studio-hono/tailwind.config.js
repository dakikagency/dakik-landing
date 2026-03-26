/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/frontend/**/*.{js,ts,jsx,tsx,html}"],
	theme: {
		extend: {
			colors: {
				primary: "#ef4444",
				background: "#000000",
			},
		},
	},
	plugins: [],
};
