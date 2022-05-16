import { ProblemDetailsOptions } from "./problem_details_options";
import { ProblemDetailsSetup } from "./problem_details_setup";

export const problemDetailsMiddleware = {
	koa(configure?: (options: ProblemDetailsOptions) => void) {
		const options = new ProblemDetailsOptions();
		configure?.(options);

		const setup = new ProblemDetailsSetup(options);
		setup.prepareProblemDetailsOptions();

		return async (context: any, next: any) => {
			try {
				await next();
			} catch (error) {
				options.appendCacheHeaders((name, value) => context.set(name, value));

				const problem = setup.prepareProblemDetails(error, context);
				context.set("content-type", options.contentTypes);
				context.status = problem.status;
				context.body = problem;
			}
		};
	},
	express(configure?: (options: ProblemDetailsOptions) => void) {
		const options = new ProblemDetailsOptions();
		configure?.(options);

		const setup = new ProblemDetailsSetup(options);
		setup.prepareProblemDetailsOptions();

		return (error: any, req: any, res: any, next: any) => {
			if (res.headersSent) {
				next(error); // delegate to default error handler
			} else {
				const context = { req, res };

				options.appendCacheHeaders((name, value) =>
					context.res.setHeader(name, value)
				);

				const problem = setup.prepareProblemDetails(error, context);
				res
					.setHeader("content-type", options.contentTypes)
					.status(problem.status)
					.json(problem);
			}
			next();
		};
	},
};
