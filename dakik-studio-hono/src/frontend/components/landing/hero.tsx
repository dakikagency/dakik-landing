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

	// Container size in viewport units so it inherits the viewport's aspect
	// ratio at every breakpoint. On a portrait phone the initial tile is
	// 38vw × 38vh ≈ a portrait thumbnail; on a landscape desktop it's a
	// landscape thumbnail of the same proportion. The video itself stays
	// 16:9 — object-cover crops as needed so the source always fills the
	// container without letterboxing.
	const videoWidth = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["38vw", "100vw", "100vw"]
	);
	const videoHeight = useTransform(
		scrollYProgress,
		[0, 0.3, 1],
		["38vh", "100vh", "100vh"]
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
					<div className="flex-1">
						<Reveal delay={0.1} direction="up">
							<h1 className="font-black text-4xl uppercase leading-[0.85] tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-8xl lg:leading-[0.85]">
								<span className="block">We Deliver</span>
								<span className="block">Digital Products</span>
								<span className="block">Bloody Work</span>
							</h1>
						</Reveal>

						{/* CTA below headline. Capped at ~40rem on lg+ so the right edge
						    sits roughly under "BLOODY WORK" and doesn't run under the
						    bottom-right video tile (38vw wide, anchored to right). */}
						<Reveal className="mt-8 lg:mt-10" delay={0.2} direction="up">
							<a
								className="group flex w-full items-center justify-center border-4 border-white bg-black px-8 py-5 font-medium text-base uppercase tracking-wider transition-colors duration-300 hover:bg-white hover:text-black lg:max-w-[40rem] lg:border-8 lg:py-7 lg:text-lg"
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
					<div
						className="absolute right-[clamp(1rem,5vw,4rem)] bottom-[clamp(2rem,5vh,4rem)]"
						style={{ width: "38vw", height: "38vh" }}
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
					</div>
				) : (
					<motion.div
						className="absolute"
						style={{
							width: videoWidth,
							height: videoHeight,
							right: videoRight,
							bottom: videoBottom,
							willChange: "width, height, right, bottom",
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
