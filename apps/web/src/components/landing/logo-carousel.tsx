"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

const placeholderLogos = [
	{ name: "Nexus", shape: "hexagon" },
	{ name: "Vertex", shape: "triangle" },
	{ name: "Cube", shape: "square" },
	{ name: "Orbit", shape: "circle" },
	{ name: "Prism", shape: "diamond" },
	{ name: "Flux", shape: "rectangle" },
	{ name: "Apex", shape: "pentagon" },
	{ name: "Nova", shape: "star" },
] as const;

type LogoShape = (typeof placeholderLogos)[number]["shape"];

function LogoShape({ shape }: { shape: LogoShape }) {
	const baseClass = "h-6 w-6 bg-current";
	const svgClass = "h-6 w-6";

	switch (shape) {
		case "hexagon":
			return (
				<svg
					aria-hidden="true"
					className={svgClass}
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
				</svg>
			);
		case "triangle":
			return (
				<svg
					aria-hidden="true"
					className={svgClass}
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 3L22 21H2L12 3Z" />
				</svg>
			);
		case "square":
			return <div aria-hidden="true" className={`${baseClass} rounded-sm`} />;
		case "circle":
			return <div aria-hidden="true" className={`${baseClass} rounded-full`} />;
		case "diamond":
			return (
				<div
					aria-hidden="true"
					className={`${baseClass} rotate-45 rounded-sm`}
				/>
			);
		case "rectangle":
			return (
				<div aria-hidden="true" className="h-4 w-8 rounded-sm bg-current" />
			);
		case "pentagon":
			return (
				<svg
					aria-hidden="true"
					className={svgClass}
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 2L22 9L18 21H6L2 9L12 2Z" />
				</svg>
			);
		case "star":
			return (
				<svg
					aria-hidden="true"
					className={svgClass}
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" />
				</svg>
			);
		default:
			return <div aria-hidden="true" className={`${baseClass} rounded-sm`} />;
	}
}

function LogoItem({ name, shape }: { name: string; shape: LogoShape }) {
	return (
		<div className="group flex flex-shrink-0 items-center gap-2 px-8 text-gray-500 transition-colors duration-300 hover:text-white">
			<LogoShape shape={shape} />
			<span className="whitespace-nowrap font-medium text-sm tracking-wide">
				{name}
			</span>
		</div>
	);
}

export function LogoCarousel() {
	const prefersReducedMotion = useReducedMotion();

	const logoSet = placeholderLogos.map((logo) => (
		<LogoItem key={logo.name} name={logo.name} shape={logo.shape} />
	));

	if (prefersReducedMotion) {
		return (
			<div className="w-full overflow-hidden">
				<p className="mb-4 text-center text-gray-500 text-xs uppercase tracking-widest">
					Trusted by innovative companies
				</p>
				<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4">
					{logoSet}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden">
			<p className="mb-4 text-center text-gray-500 text-xs uppercase tracking-widest">
				Trusted by innovative companies
			</p>
			<div className="group relative flex overflow-hidden [--duration:30s]">
				{/* Fade edges */}
				<div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
				<div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

				{/* First set */}
				<div className="flex animate-marquee items-center group-hover:[animation-play-state:paused]">
					{logoSet}
				</div>

				{/* Duplicate for seamless loop */}
				<div
					aria-hidden="true"
					className="flex animate-marquee items-center group-hover:[animation-play-state:paused]"
				>
					{logoSet}
				</div>
			</div>
		</div>
	);
}
