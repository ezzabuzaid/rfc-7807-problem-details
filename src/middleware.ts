import { ProblemDetailsOptions } from "./problem_details_options";
import type { Response, ErrorRequestHandler } from "express";
import { getReasonPhrase } from "http-status-codes";
import { ProblemDetails } from "./problem_details";
import { ProblemDetailsException } from "./problem_details_exception";
export function problemDetailsMiddleware(
	configure?: (options: ProblemDetailsOptions) => void
): ErrorRequestHandler {
	const options = new ProblemDetailsOptions();
	configure?.(options);

	options.includeExceptionDetails ??= () =>
		(process.env.NODE_ENV || "development") === "development";

	options.exceptionDetailsPropertyName ||=
		ProblemDetailsOptions.DefaultExceptionDetailsPropertyName;

	options.typePrefix ??= `https://httpstatuses.io`;

	if (options.contentTypes.length === 0) {
		options.contentTypes = ["application/problem+json"];
	}

	options.appendCacheHeaders ??= (req, res) => {
		res.setHeader("cache-control", "no-cache, no-store, must-revalidate");
		res.setHeader("pragma", "no-cache");
		res.setHeader("etag", "0");
		res.setHeader("expires", "0");
	};

	options.mapStatusCode ??= (req, res) => {
		const title = undefined; // will be set to status code text in the middleware
		const problem = new ProblemDetails(
			`${res.statusCode}`,
			title,
			res.statusCode
		);
		return problem;
	};

	options.isProblem ??= (response: Response) => {
		// Always return true and let the developer change it based on his requrirment
		// in case the developer throws an error from any other middlware this should be fine
		// in case the developer return kind of "error" object he can modify this function to intercept it as
		// return an error response
		return true;
	};

	// FIXME: in koajs, the error handler middleware act just like .net middleware so different export needed
	return (error: any, req: any, res: any, next: any) => {
		if (res.headersSent) {
			next(error); // delegate to default error handler
		} else {
			let problem: ProblemDetails;
			if (error instanceof ProblemDetailsException) {
				problem = error.Details;
				problem.detail ??= error.message;
			} else {
				problem = options.mapToProblemDetails(
					{ request: req, response: res },
					error
				);
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
				problem.title = getReasonPhrase(problem.status);
			}

			// Set instance to the request url
			problem.instance = req.url;

			if (options.includeExceptionDetails()) {
				if (!(error instanceof Error)) {
					Error.captureStackTrace(error);
				}
				const stack: string | undefined = error.stack;

				problem[options.exceptionDetailsPropertyName] = stack
					?.split("\n")
					.map((line) => line.trim());
			}

			res
				.setHeader("content-type", options.contentTypes)
				.status(problem.status)
				.json(problem);
		}
		next();
	};
}
