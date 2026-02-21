"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function CustomCursor() {
	const [isVisible, setIsVisible] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const [isClicking, setIsClicking] = useState(false);
	const pathname = usePathname();

	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);

	const springConfig = { damping: 25, stiffness: 400 };
	const cursorXSpring = useSpring(cursorX, springConfig);
	const cursorYSpring = useSpring(cursorY, springConfig);

	useEffect(() => {
		// Only run on non-touch devices
		if (window.matchMedia("(pointer: coarse)").matches) {
			return;
		}

		const moveCursor = (e: MouseEvent) => {
			cursorX.set(e.clientX);
			cursorY.set(e.clientY);
			if (!isVisible) {
				setIsVisible(true);
			}
		};

		const handleMouseDown = () => setIsClicking(true);
		const handleMouseUp = () => setIsClicking(false);

		const handleMouseLeave = () => setIsVisible(false);
		const handleMouseEnter = () => setIsVisible(true);

		const addHoverListeners = () => {
			const interactables = document.querySelectorAll(
				'a, button, input, textarea, select, [role="button"]'
			);

			for (const el of interactables) {
				el.addEventListener("mouseenter", () => setIsHovering(true));
				el.addEventListener("mouseleave", () => setIsHovering(false));
			}
		};

		window.addEventListener("mousemove", moveCursor);
		window.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("mouseleave", handleMouseLeave);
		document.addEventListener("mouseenter", handleMouseEnter);

		addHoverListeners();

		// Create a mutation observer to catch dynamically added elements
		const observer = new MutationObserver(() => {
			addHoverListeners();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		return () => {
			window.removeEventListener("mousemove", moveCursor);
			window.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("mouseenter", handleMouseEnter);
			observer.disconnect();
		};
	}, [cursorX, cursorY, isVisible, pathname]);

	if (
		typeof window !== "undefined" &&
		window.matchMedia("(pointer: coarse)").matches
	) {
		return null;
	}

	let scale = 1;
	if (isHovering) {
		scale = 2;
	} else if (isClicking) {
		scale = 0.8;
	}

	return (
		<motion.div
			className="pointer-events-none fixed top-0 left-0 z-[100] hidden mix-blend-difference md:block"
			style={{
				x: cursorXSpring,
				y: cursorYSpring,
				opacity: isVisible ? 1 : 0,
			}}
		>
			<motion.div
				animate={{
					scale,
					opacity: isHovering ? 0.5 : 1,
				}}
				className="flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform duration-200"
			/>
		</motion.div>
	);
}
