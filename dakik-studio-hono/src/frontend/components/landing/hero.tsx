import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "../../hooks/use-reduced-motion";
import { Reveal } from "../motion";
import Noise from "../noise";

export function Hero() {
	const sectionRef = useRef<HTMLElement>(null);
	const prefersReducedMotion = useReducedMotion();

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});

	const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

	const videoWidth = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["50%", "100vw", "100vw"]
	);
	const videoRight = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["20px", "0px", "0px"]
	);
	const videoBottom = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["20px", "0px", "0px"]
	);

	const videoY = useTransform(scrollYProgress, [0, 1], ["0px", "100px"]);

	return (
		<section
			className="relative h-[200vh] bg-black text-white"
			id="hero"
			ref={sectionRef}
		>
			<div className="sticky top-0 h-screen overflow-hidden">
				<motion.div
					className="relative mx-auto flex h-full flex-col px-[clamp(1rem,5vw,4rem)] pt-[clamp(6rem,15vh,10rem)] pb-[clamp(2rem,5vh,4rem)]"
					style={{ opacity: prefersReducedMotion ? 1 : textOpacity }}
				>
					<div className="mb-8 flex flex-wrap items-center gap-4">
						<Reveal delay={0.05} direction="up">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
								<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
									Dakik Studio
								</span>
								<span className="hidden h-px w-12 bg-white/20 sm:block" />
								<span className="text-sm text-white/55">
									Client portal and digital product studio
								</span>
							</div>
						</Reveal>
					</div>

					<div className="flex-1">
						<Reveal delay={0.1} direction="up">
							<h1 className="font-black text-4xl uppercase leading-[0.85] tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-8xl lg:leading-[0.7em]">
								<span className="block lg:leading-[0.6em]">WE DELIVER</span>
								<span className="block lg:leading-[0.7em]">
									DIGITAL PRODUCTS
								</span>
								<span className="block lg:flex lg:items-end lg:gap-[0.15em] lg:leading-[0.7em]">
									<span>BLOODY WORK</span>
									{/* Desktop-only inline button — fills remaining row width.
									    Mobile / tablet get the separate button below. */}
									<a
										className="hidden lg:inline-flex group h-[0.72em] flex-1 items-center justify-center border-8 border-white bg-black px-[0.25em] transition-colors duration-300 hover:bg-white hover:text-black"
										href="/survey"
									>
										<span className="text-nowrap font-medium text-lg uppercase tracking-wider">
											Start a Project
										</span>
									</a>
								</span>
							</h1>
						</Reveal>

						{/* Mobile / tablet button: full-width on phones, fit on small tablets. */}
						<Reveal className="mt-6 lg:hidden" delay={0.2} direction="up">
							<a
								className="group inline-flex w-full items-center justify-center border-4 border-white bg-black px-8 py-4 font-medium text-base uppercase tracking-wider transition-colors duration-300 hover:bg-white hover:text-black sm:w-auto"
								href="/survey"
							>
								Start a Project
							</a>
						</Reveal>
					</div>

					<Reveal
						className="absolute top-1/2 right-[clamp(1rem,5vw,4rem)] hidden -translate-y-1/2 lg:block"
						delay={0.6}
						direction="right"
					>
						<span className="text-sm tracking-wide">(Scroll)</span>
					</Reveal>

					<div className="mt-auto mb-24 lg:mb-0 lg:max-w-[50%] lg:pr-8">
						<Reveal delay={0.4} direction="down">
							<p className="max-w-[44ch] text-base text-white/80 leading-snug sm:text-lg lg:text-xl">
								We build the stuff that ships — websites, apps, brand systems,
								AI that earns its keep. No agency theatre.
							</p>
						</Reveal>
					</div>
				</motion.div>

				{prefersReducedMotion ? (
					<div className="absolute right-[clamp(1rem,5vw,4rem)] bottom-[clamp(2rem,5vh,4rem)] w-1/2">
						<video
							autoPlay
							className="h-full w-full object-cover shadow-2xl"
							loop
							muted
							playsInline
							src="/video.mp4"
						/>
						<VideoCorners />
					</div>
				) : (
					<motion.div
						className="absolute aspect-video"
						style={{
							width: videoWidth,
							right: videoRight,
							bottom: videoBottom,
							y: videoY,
							willChange: "width, height, right, bottom, transform",
						}}
					>
						<video
							autoPlay
							className="h-full w-full object-cover shadow-2xl"
							loop
							muted
							playsInline
							src="/video.mp4"
						/>
						<VideoCorners />
					</motion.div>
				)}

				<Noise
					patternAlpha={25}
					patternRefreshInterval={2}
					patternScaleX={1}
					patternScaleY={1}
					patternSize={500}
				/>
			</div>
		</section>
	);
}

function VideoCorners() {
	return (
		<div className="pointer-events-none absolute inset-0">
			<span className="absolute -top-1.5 -left-1.5 h-5 w-1 bg-white" />
			<span className="absolute -top-1.5 -left-1 h-1 w-4 bg-white" />
			<span className="absolute -top-1.5 -right-1.5 h-5 w-1 bg-white" />
			<span className="absolute -top-1.5 -right-1 h-1 w-4 bg-white" />
			<span className="absolute -bottom-1.5 -left-1.5 h-5 w-1 bg-white" />
			<span className="absolute -bottom-1.5 -left-1 h-1 w-4 bg-white" />
			<span className="absolute -right-1.5 -bottom-1.5 h-5 w-1 bg-white" />
			<span className="absolute -right-1 -bottom-1.5 h-1 w-4 bg-white" />
		</div>
	);
}
