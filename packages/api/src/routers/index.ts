import { protectedProcedure, publicProcedure, router } from "../index";
import { adminRouter } from "./admin";
import { auditRouter } from "./audit";
import { automationRouter } from "./automation";
import { availabilityRouter } from "./availability";
import { blogRouter } from "./blog";
import { componentsRouter } from "./components";
import { contractsRouter } from "./contracts";
import { emailRouter } from "./email";
import { iconsRouter } from "./icons";
import { invoicesRouter } from "./invoices";
import { meetingsRouter } from "./meetings";
import { portalRouter } from "./portal";
import { surveyRouter } from "./survey";
import { surveyOptionsRouter } from "./survey-options";
import { uploadsRouter } from "./uploads";
import { webhooksRouter } from "./webhooks";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	admin: adminRouter,
	audit: auditRouter,
	automation: automationRouter,
	availability: availabilityRouter,
	blog: blogRouter,
	components: componentsRouter,
	contracts: contractsRouter,
	email: emailRouter,
	icons: iconsRouter,
	invoices: invoicesRouter,
	meetings: meetingsRouter,
	portal: portalRouter,
	survey: surveyRouter,
	surveyOptions: surveyOptionsRouter,
	uploads: uploadsRouter,
	webhooks: webhooksRouter,
});
export type AppRouter = typeof appRouter;
