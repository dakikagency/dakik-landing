export default {
	dialect: "postgres",
	dialectConfig: {
		connectionString: process.env.DATABASE_URL,
	},
	outFile: "src/db.types.ts",
};
