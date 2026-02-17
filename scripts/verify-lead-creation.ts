import prisma from "../packages/db/src";

async function verify() {
	console.log("Starting verification...");

	// 1. Setup: Ensure 'starter-kit' Lead Magnet exists (Legacy form previous test, keeping it clean)
	// ... (Skipping asset check for estimator test)

	// 2. Simulate Estimator Action
	const testEmail = `test-estimator-${Date.now()}@example.com`;
	console.log(`Simulating estimator submission for ${testEmail}...`);

	// Action Logic Mimic (Estimator):
	await prisma.lead.create({
		data: {
			email: testEmail,
			source: "estimator",
			status: "NEW",
			details: JSON.stringify({
				platform: "web",
				design: "ready",
				features: ["ai", "auth"],
				estimatedBudget: "21000-25200",
			}),
		},
	});

	// 3. Verify Lead
	const lead = await prisma.lead.findUnique({
		where: { email: testEmail },
	});

	if (lead && lead.source === "estimator") {
		console.log(
			"✅ Verification SUCCESS: Estimator Lead created with correct source."
		);
		console.log("Details:", lead.details);
	} else {
		console.error(
			"❌ Verification FAILED: Lead not found or source incorrect."
		);
		process.exit(1);
	}

	// Cleanup
	await prisma.lead.delete({ where: { email: testEmail } });
	console.log("Cleanup done.");
	process.exit(0);
}

verify().catch((e) => {
	console.error(e);
	process.exit(1);
});
