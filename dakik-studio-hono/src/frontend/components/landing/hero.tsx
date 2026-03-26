import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
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
					<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
						<Reveal delay={0.05} direction="up">
							<div className="flex items-center gap-3">
								<span className="font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
									Dakik Studio
								</span>
								<span className="hidden h-px w-12 bg-white/20 sm:block" />
								<span className="text-sm text-white/55">
									Client portal and digital product studio
								</span>
							</div>
						</Reveal>
						<Reveal delay={0.1} direction="left">
							<a
								className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
								href="/privacy-policy"
							>
								Privacy Policy
							</a>
						</Reveal>
					</div>

					<div className="flex-1">
						<Reveal delay={0.1} direction="up">
							<h1 className="relative block text-left font-black text-5xl uppercase leading-[0.7em] tracking-[-0.03em] lg:inline lg:text-8xl">
								<span className="leading-[0.6em]">WE DELIVER</span>
								<br className="leading-[0.6em]" />
								<span className="relative block leading-none lg:inline">
									<span className="text-nowrap leading-[0.7em]">
										DIGITAL PRODUCTS
									</span>
									<span className="absolute top-0 left-0 mt-[0.84em] w-full lg:mt-[1em]">
										<span className="items-center-safe block text-5xl leading-none lg:inline lg:flex lg:flex-1 lg:text-8xl">
											<span className="text-nowrap leading-[0.7em]">
												BLOODY WORK
											</span>
											<a
												className="group mt-[0.20em] ml-[0.1em] inline-flex h-[1em] w-full translate-y-[-0.08em] items-center justify-center border-4 border-white bg-black px-[0.25em] align-middle transition-all duration-300 hover:bg-white hover:text-black lg:h-[0.72em] lg:w-[calc(100%-0.1em-16px)] lg:border-8"
												href="/survey"
											>
												<span className="text-nowrap font-medium text-lg uppercase tracking-wider">
													Start a Project
												</span>
											</a>
										</span>
									</span>
								</span>
							</h1>
						</Reveal>
					</div>

					<Reveal
						className="absolute top-1/2 right-[clamp(1rem,5vw,4rem)] hidden -translate-y-1/2 lg:block"
						delay={0.6}
						direction="right"
					>
						<span className="text-sm tracking-wide">(Scroll)</span>
					</Reveal>

					<div className="mt-auto mb-32 lg:mb-0">
						<Reveal delay={0.4} direction="down">
							<p className="max-w-[25ch] text-3xl text-white/90 leading-[1.15]">
								Dakik Studio helps teams launch websites, apps, brand systems,
								and AI automations that are built to ship.
							</p>
						</Reveal>
						<Reveal delay={0.5} direction="down">
							<p className="mt-4 max-w-[46ch] text-base text-white/65 leading-relaxed lg:text-lg">
								Clients use the app to start projects, book discovery calls,
								review scope, sign contracts, manage invoices, and keep delivery
								moving in one place.
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
