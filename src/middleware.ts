import { ProblemDetailsOptions } from "./problem_details_options";
import { getReasonPhrase } from "http-status-codes";
import { ProblemDetails } from "./problem_details";
import { ProblemDetailsException } from "./problem_details_exception";
import type { HttpContext } from "./context";

function prepareProblemDetails(
	options: ProblemDetailsOptions,
	error: any,
	context: HttpContext
): ProblemDetails {
	let problem: ProblemDetails;
	if (error instanceof ProblemDetailsException) {
		problem = error.Details;
		problem.detail ??= error.message;
	} else {
		problem = options.mapToProblemDetails(context, error);
	}

	if (!problem.type) {
		// Set problem details type to "about:blank" if not present
		problem.type = "about:blank";
	} else if (!/^((http|https):\/\/)/.test(problem.type)) {
		problem.type = `${options.typePrefix}/${problem.type}`;
		// If it doesn't start with valid https or http then use typePrefix
	}
	// if it's url that means the developer did this intentionally.

	// Set problem details title to status code text if title is not present
	if (!problem.title && problem.status) {
		// https://datatracker.ietf.org/doc/html/rfc7807#section-4.2
		problem.title = getReasonPhrase(problem.status);
	}

	// Set instance to the request url
	problem.instance = context.req.url;

	if (options.includeExceptionDetails()) {
		if (!(error instanceof Error)) {
			Error.captureStackTrace(error, prepareProblemDetails);
		}
		const stack: string | undefined = error.stack;

		problem[options.exceptionDetailsPropertyName] = stack
			?.split("\n")
			.map((line) => line.trim());
	}

	return problem;
}

export function prepareProblemDetailsOptions(options: ProblemDetailsOptions) {
	options.includeExceptionDetails ??= () =>
		(process.env.NODE_ENV || "development") === "development";

	options.exceptionDetailsPropertyName ||=
		ProblemDetailsOptions.DefaultExceptionDetailsPropertyName;

	options.typePrefix ??= `https://httpstatuses.io`;

	if (options.contentTypes.length === 0) {
		options.contentTypes = ["application/problem+json"];
	}

	options.appendCacheHeaders ??= (setHeader) => {
		setHeader("cache-control", "no-cache, no-store, must-revalidate");
		setHeader("pragma", "no-cache");
		setHeader("etag", "0");
		setHeader("expires", "0");
	};

	options.mapStatusCode ??= (context: HttpContext, statusCode: number) => {
		const title = undefined; // will be set to status code text in the middleware
		const problem = new ProblemDetails(
			`${context.res.status}`,
			title,
			context.res.status
		);
		return problem;
	};

	options.isProblem ??= (context) => {
		// Always return true and let the developer change it based on his requrirment
		// in case the developer throws an error from any other middlware this should be fine
		// in case the developer return kind of "error" object he can modify this function to intercept it as
		// return an error response
		return true;
	};
}

export const problemDetailsMiddleware = {
	koa(configure?: (options: ProblemDetailsOptions) => void) {
		const options = new ProblemDetailsOptions();
		configure?.(options);

		prepareProblemDetailsOptions(options);

		return async (context: any, next: any) => {
			try {
				await next();
			} catch (error) {
				options.appendCacheHeaders((name, value) =>
					context.res.setHeader(name, value)
				);

				const problem = prepareProblemDetails(options, error, context);
				context.set("content-type", options.contentTypes);
				context.status = problem.status;
				context.body = problem;
			}
		};
	},
	express(configure?: (options: ProblemDetailsOptions) => void) {
		const options = new ProblemDetailsOptions();
		configure?.(options);

		prepareProblemDetailsOptions(options);
		return (error: any, req: any, res: any, next: any) => {
			if (res.headersSent) {
				next(error); // delegate to default error handler
			} else {
				const context = { req, res };

				options.appendCacheHeaders((name, value) =>
					context.res.setHeader(name, value)
				);

				const problem = prepareProblemDetails(options, error, context);
				res
					.setHeader("content-type", options.contentTypes)
					.status(problem.status)
					.json(problem);
			}
			next();
		};
	},
};
