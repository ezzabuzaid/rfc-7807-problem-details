import { Application } from "https://deno.land/x/oak/mod.ts";
import {
	ProblemDetailsException,
	ProblemDetailsOptions,
	ProblemDetailsSetup,
} from "https://esm.sh/rfc-7807-problem-details";
const app = new Application();

app.use(async (ctx, next) => {
	// set your options before constructing ProblemDetailsSetup
	const options = new ProblemDetailsOptions();
	options.typePrefix = `https://example.com/probs/out-of-credit`;

	const setup = new ProblemDetailsSetup(options);

	return async (context: any, next: any) => {
		try {
			await next();
		} catch (error) {
			options.appendCacheHeaders((name, value) =>
				ctx.response.headers.set(name, value)
			);

			const problem = setup.prepareProblemDetails(error, context);
			ctx.response.headers.set("content-type", options.contentTypes);
			context.status = problem.status;
			context.body = problem;
		}
	};
});
app.use(async (ctx, next) => {
	switch (ctx.request.url.pathname) {
		case "/example/throw":
			throw new ProblemDetailsException({
				type: "cannot-proceed",
				status: 400,
				title: "You cannot proceed.",
			});
		default:
			ctx.response.body = "Hello World";
			break;
	}
	await next();
});

await app.listen({ port: 8000 });
