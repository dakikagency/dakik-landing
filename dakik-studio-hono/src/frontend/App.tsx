import { Hero, Navbar } from "./components/landing";

export default function App() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Navbar />
			<Hero />
		</div>
	);
}
