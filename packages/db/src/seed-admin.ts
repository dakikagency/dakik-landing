/**
 * Seed script to set admin users in the database
 * Run with: bun packages/db/src/seed-admin.ts
 */
import prisma from "./index";

// Admin email addresses that should have ADMIN role
const ADMIN_EMAILS = ["erdeniz@dakik.co.uk"];

async function seedAdmins() {
	console.log("Setting admin roles for configured email addresses...");

	for (const email of ADMIN_EMAILS) {
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (user) {
			if (user.role === "ADMIN") {
				console.log(`User ${email} already has ADMIN role`);
			} else {
				await prisma.user.update({
					where: { email },
					data: { role: "ADMIN" },
				});
				console.log(`Updated ${email} to ADMIN role`);
			}
		} else {
			console.log(
				`User ${email} not found - they will get ADMIN role when they sign up`
			);
		}
	}

	console.log("Done!");
}

seedAdmins()
	.catch((error) => {
		console.error("Error seeding admins:", error);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});
