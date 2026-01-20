"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		console.error("Global application error:", error);
	}, [error]);

	return (
		<html lang="en">
			<head>
				<title>Error | Dakik Studio</title>
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<style
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for inline styles in global error boundary
					dangerouslySetInnerHTML={{
						__html: `
							* {
								margin: 0;
								padding: 0;
								box-sizing: border-box;
							}
							body {
								font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
								background-color: #ffffff;
								color: #171717;
								min-height: 100vh;
								display: flex;
								align-items: center;
								justify-content: center;
							}
							@media (prefers-color-scheme: dark) {
								body {
									background-color: #171717;
									color: #f5f5f5;
								}
								.icon-container {
									background-color: #262626 !important;
									border-color: rgba(255, 255, 255, 0.1) !important;
								}
								.button {
									background-color: #f5f5f5 !important;
									color: #171717 !important;
								}
								.button-outline {
									background-color: transparent !important;
									color: #f5f5f5 !important;
									border-color: rgba(255, 255, 255, 0.1) !important;
								}
								.button-outline:hover {
									background-color: #262626 !important;
								}
								.error-id {
									color: #737373 !important;
								}
							}
							.container {
								display: flex;
								flex-direction: column;
								align-items: center;
								text-align: center;
								max-width: 28rem;
								padding: 1rem;
								animation: fadeIn 0.5s ease-out;
							}
							@keyframes fadeIn {
								from {
									opacity: 0;
									transform: translateY(20px);
								}
								to {
									opacity: 1;
									transform: translateY(0);
								}
							}
							.icon-container {
								width: 6rem;
								height: 6rem;
								display: flex;
								align-items: center;
								justify-content: center;
								border-radius: 50%;
								border: 1px solid #e5e5e5;
								background-color: #f5f5f5;
								margin-bottom: 2rem;
							}
							.icon {
								width: 3rem;
								height: 3rem;
								color: #737373;
							}
							h1 {
								font-size: 2.25rem;
								font-weight: 700;
								letter-spacing: -0.025em;
								margin-bottom: 0.75rem;
							}
							p {
								color: #737373;
								margin-bottom: 2rem;
								line-height: 1.5;
							}
							.buttons {
								display: flex;
								flex-direction: column;
								gap: 0.75rem;
							}
							@media (min-width: 640px) {
								.buttons {
									flex-direction: row;
								}
							}
							.button {
								display: inline-flex;
								align-items: center;
								justify-content: center;
								gap: 0.5rem;
								padding: 0.5rem 1rem;
								font-size: 0.875rem;
								font-weight: 500;
								background-color: #171717;
								color: #ffffff;
								border: 1px solid transparent;
								cursor: pointer;
								transition: all 0.15s ease;
							}
							.button:hover {
								opacity: 0.9;
							}
							.button-outline {
								background-color: transparent;
								color: #171717;
								border-color: #e5e5e5;
							}
							.button-outline:hover {
								background-color: #f5f5f5;
							}
							.button svg {
								width: 1rem;
								height: 1rem;
							}
							.error-id {
								position: absolute;
								bottom: 2rem;
								font-size: 0.875rem;
								color: #737373;
							}
						`,
					}}
				/>
			</head>
			<body>
				<div className="container">
					<div className="icon-container">
						<svg
							aria-hidden="true"
							className="icon"
							fill="currentColor"
							viewBox="0 0 256 256"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
						</svg>
					</div>
					<h1>Critical Error</h1>
					<p>
						A critical error has occurred and the application could not recover.
						Please try again or return to the home page.
					</p>
					<div className="buttons">
						<button className="button" onClick={reset} type="button">
							<svg
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 256 256"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z" />
							</svg>
							Try Again
						</button>
						<a className="button button-outline" href="/">
							<svg
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 256 256"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z" />
							</svg>
							Return to Home
						</a>
					</div>
				</div>
				{error.digest ? (
					<div className="error-id">Error ID: {error.digest}</div>
				) : null}
			</body>
		</html>
	);
}
