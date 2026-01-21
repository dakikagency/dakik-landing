"use client";

import { useSyncExternalStore } from "react";

// SSR-safe reduced motion detection using useSyncExternalStore
const getServerSnapshot = () => false;

const getSnapshot = () =>
	typeof window !== "undefined"
		? window.matchMedia("(prefers-reduced-motion: reduce)").matches
		: false;

const noop = () => {
	// Intentionally empty - no-op function for SSR
};

const subscribe = (callback: () => void) => {
	if (typeof window === "undefined") {
		return noop;
	}

	const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
	mediaQuery.addEventListener("change", callback);
	return () => mediaQuery.removeEventListener("change", callback);
};

export function useReducedMotion(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
