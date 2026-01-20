"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface LenisProviderProps {
	children: React.ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
	const prefersReducedMotion = useReducedMotion();

	// Type assertion needed due to React 19 and @studio-freight/react-lenis type mismatch
	const LenisWithAnyChildren = ReactLenis as React.ComponentType<{
		children: React.ReactNode;
		options: Record<string, unknown>;
		root: boolean;
	}>;

	// Disable smooth scrolling when user prefers reduced motion
	if (prefersReducedMotion) {
		return <>{children}</>;
	}

	return (
		<LenisWithAnyChildren
			options={{
				lerp: 0.1,
				duration: 1.2,
				smoothWheel: true,
				wheelMultiplier: 1,
				touchMultiplier: 2,
				infinite: false,
			}}
			root
		>
			{children}
		</LenisWithAnyChildren>
	);
}
